# CORS Fix Spec — Dev Mode Doc Page Fetch via HTTP Middleware

## 1. Overview

EasyCoda 在开发模式下使用 Vite dev server 时，`fetchDocPage` 通过 `import()` 动态加载 virtual module (`virtual:easydoc-doc:<lang>/<path>`)。当 dev server 通过外部 ingress（如 `https://dev-xxx.easycoda.com`）访问时，浏览器会将 `import('virtual:easydoc-doc:en/guide/getting-started')` 解析为跨域请求，直接请求字面量 URL `virtual:easydoc-doc:en/guide/getting-started`，触发 CORS 错误。

**解决方案**：在 Vite plugin 的 `configureServer` 中添加 HTTP middleware endpoint `/api/doc/:lang/*`，以 JSON 格式返回编译好的 `DocPageData`，并修改 `docService.ts` 中的 `fetchDocPage`，在 dev 模式下使用 `fetch()` 而非 `import()`。

---

## 2. Routes（本次变更不涉及新增页面路由）

本次变更为内部基础架构修复，不新增或修改页面路由。仅涉及以下两个文件的内部逻辑：

| 变更类型 | 文件 | 说明 |
|---|---|---|
| 修改 | `src/plugins/vite-plugin-easydoc.ts` | 新增 `/api/doc/:lang/*` middleware |
| 修改 | `src/services/docService.ts` | `fetchDocPage` 增加 dev/prod 分支 |

---

## 3. Component Map（本次无页面级组件变更）

本次不涉及页面或 UI 组件变更。调用链如下：

```
DocPage (src/pages/Doc.tsx)
  └── useDocData (src/hooks/useDocData.ts)
        └── fetchDocPage (src/services/docService.ts)   ← 修改点
              ├── DEV:  fetch('/api/doc/<lang>/<path>')   ← 新增
              └── PROD: import('virtual:easydoc-doc:<lang>/<path>')  ← 保留
```

Vite Plugin 端的调用链：

```
configureServer (src/plugins/vite-plugin-easydoc.ts)   ← 修改点
  └── /api/doc/:lang/*  middleware                       ← 新增
        └── compiler.compile(raw)                        ← 复用已有
```

---

## 4. Shared TypeScript Types

本次变更**不引入新类型**。所有类型均已定义完毕。

| 类型 | 文件 | 用途 |
|---|---|---|
| `DocPageData` | `src/types/doc.ts` | `/api/doc` endpoint 返回体和 `fetchDocPage` 返回值 |
| `EasyDocPluginOptions` | `src/types/vite-plugin.ts` | 插件配置（`locales` 等） |
| `VIRTUAL_DOC_PREFIX` | `src/types/vite-plugin.ts` | Virtual module 前缀常量 |

> 无需新增或修改 `src/types/` 下的任何文件。

---

## 5. State Architecture

本次变更不新增任何状态。不涉及 Zustand store、React state 或 context。

---

## 6. API / Data Layer

### 6.1 新增 HTTP Endpoint: `GET /api/doc/:lang/*`

| 属性 | 描述 |
|---|---|
| **HTTP Method** | `GET` |
| **URL Pattern** | `/api/doc/:lang/*` — `:lang` 为语言代码（如 `en`），`*` 为文档路径（如 `guide/getting-started`） |
| **处理逻辑** | 1. 从 URL 解析 `lang` 和 splat 路径<br>2. 拼接文件路径：`docsRoot/<lang>/<splat>.md`（若 splat 为空则 `index.md`）<br>3. 若 `.md` 文件不存在，返回 404 JSON<br>4. 读取 `.md` 文件内容<br>5. 调用 `compiler.initialize()` 初始化（幂等）<br>6. 调用 `compiler.compile(raw)` 编译<br>7. 构造 `DocPageData` 对象并作为 JSON 返回 |
| **Response (200)** | `DocPageData` JSON |
| **Response (404)** | `{ error: "Not found" }` |
| **Content-Type** | `application/json` |
| **实现位置** | `configureServer` 回调内，在现有 `search-index.json` 和 `manifest-<lang>.json` middleware 之后追加 |

### 6.2 修改: `fetchDocPage`

| 属性 | 变更前 | 变更后 |
|---|---|---|
| **Dev 模式** | `import(/* @vite-ignore */ moduleId)` → CORS 错误 | `fetch('/api/doc/${lang}/${path}')` → `res.json()` |
| **Prod 模式** | `import(/* @vite-ignore */ moduleId)` | 不变（保留原逻辑） |
| **模式检测** | 无 | `import.meta.env.DEV`（Vite 内置变量） |
| **错误处理** | import 失败抛出异常 | fetch 非 ok 时抛出 `Error`（含 status） |

### 6.3 未变更的函数

- `fetchDocManifest` — **不修改**。manifest 已通过 `/manifest-<lang>.json` middleware 提供。
- `fetchSearchIndex` — **不修改**。已使用 `fetch('/search-index.json')` 方式。
- `docKeys` — **不修改**。

---

## 7. Conventions

- 所有修改遵循 `spec/conventions.md` 中的命名规则
- Vite plugin middleware 命名风格与现有 `/search-index.json`、`/manifest-<lang>.json` 保持一致
- `fetchDocPage` 新增的 URL 路径使用 kebab-case：`/api/doc/`
- 使用 `import.meta.env.DEV` 进行环境判断（Vite 内置，无需额外配置）
- 不使用 `process.env` 或 `import.meta.env.MODE`
- 不引入新的 npm 依赖