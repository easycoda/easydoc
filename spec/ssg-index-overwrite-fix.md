# Fix: SSG Home page 循环覆盖文档 index.html

## 1 Overview

修复 `vite-plugin-easydoc.ts` 的 `closeBundle` 钩子中，Home page SSG 循环无条件覆盖 `dist/<lang>/index.html` 的问题。当 `docs/<lang>/index.md` 存在时，文档 SSG 步骤已先写入 `dist/<lang>/index.html`，但随后的 Home page SSG 循环覆盖了该文件，导致 `/:lang/index` 路由的文档内容丢失。

核心修复：在 Home page SSG 循环写入 `dist/<lang>/index.html` 之前，检查该路径是否已被文档 SSG 步骤生成。若已存在则跳过。

同时分析并提出 `docs/<lang>/index.md` SSG 输出路径的重构方案（可选改进），解决 `/:lang`（Home page）与 `/:lang/index`（文档索引页）共用同一 SSG 文件导致的水合内容不匹配问题。

---

## 2 Pages & Routes（当前路由，无需修改）

| Route Path | Component Name | File Path | Auth Required | SSG Output |
|---|---|---|---|---|
| `/` | `HomePage` | `src/pages/Home.tsx` | No | `dist/index.html` |
| `/:lang` | `LangHomePage` | `src/pages/LangHome.tsx` | No | `dist/<lang>/index.html` (Home) |
| `/:lang/*` | `DocPage` | `src/pages/Doc.tsx` | No | `dist/<lang>/<path>/index.html` |
| `*` | `NotFoundPage` | `src/pages/NotFound.tsx` | No | N/A |

路由匹配规则（React Router v7）：
- `/en` → 匹配 `/:lang`，渲染 `LangHomePage`
- `/en/index` → 匹配 `/:lang/*`（splat=`"index"`），渲染 `DocPage`
- `/en/guide/getting-started` → 匹配 `/:lang/*`（splat=`"guide/getting-started"`），渲染 `DocPage`

---

## 3 Component Map

### 3.1 `DocPage`（`src/pages/Doc.tsx`）— 无需修改

**职责**：提取 `lang` 和 `*`（splat）参数，调用 `useDocData(lang, resolvedPath)` 获取文档数据并渲染。

**关键逻辑**：
- `resolvedPath = splat || 'index'` — 当 splat 为 `undefined` 或空时回退为 `'index'`
- 当访问 `/en/index`：`lang="en"`, `splat="index"`, `resolvedPath="index"` → `useDocData("en", "index")`
- 当访问 `/en/guide/start`：`lang="en"`, `splat="guide/start"`, `resolvedPath="guide/start"`

**Props**：无（从 `useParams` 获取路由参数）

**数据**：`useDocData(lang, path)` → TanStack Query → `fetchDocPage(lang, path)`

**状态**：loading（骨架屏）、error/not found（404 页面）、success（`DocContent` + `DocNav`）

### 3.2 `LangHomePage`（`src/pages/LangHome.tsx`）— 无需修改

**职责**：验证 `lang` 参数，设置应用 locale，渲染 `HomePage`。

**Props**：无

**数据**：`lang` from `useParams`、`siteConfig` 用于验证、`useAppStore.setLocale` 用于同步 locale

**注意**：`LangHomePage` 不调用 `useDocData`，不消费 `window.__HYDRATION_DATA__`。

---

## 4 Shared TypeScript Types（无需修改）

所有类型已在现有文件中正确定义：

- `SsgPageEntry` — 在 `vite-plugin-easydoc.ts` 内部定义
- `HydrationData` — `src/types/hydration.ts`
- `HomeHydrationData` — `src/types/hydration.ts`
- `DocPageData` — `src/types/doc.ts`

---

## 5 State Architecture（无需修改）

| State | Type | Default | Owner | Scope |
|---|---|---|---|---|
| `locale` | `Locale` | `'en'` | `useAppStore` | Global |
| Hydration data | `HydrationData \| HomeHydrationData` | `window.__HYDRATION_DATA__` | SSG HTML `<script>` | Per-page |
| Doc page data | `DocPageData` | TanStack Query cache | `useDocData` | Per-query |

---

## 6 Current Data Flow — Root Cause Analysis

### 6.1 `closeBundle` 执行顺序（当前代码）

```
1. 读取 dist/index.html 模板
2. collectAllSsgEntries() — 收集所有文档条目
3. for each doc entry:
     if docPath === '' (index.md):
       write → dist/<lang>/index.html        ← 文档 SSG 写入
     else:
       write → dist/<lang>/<docPath>/index.html
4. for each lang in locales:
     generate home page HTML
     write → dist/<lang>/index.html           ← 覆盖文档 SSG 写入！
     if lang === defaultLocale:
       write → dist/index.html (root)
```

### 6.2 问题场景

当 `docs/en/index.md` 存在时：

1. **collectAllSsgEntries()** 通过 `collectDocFiles` 发现 `docs/en/index.md`
   - `file.relativePath === 'index'` → `isIndex = true`
   - `modulePath = "en"`, `docPath = ""`
2. **文档 SSG 步骤**：`docPath === ''` → 写入 `dist/en/index.html`（包含编译后的 Markdown 内容 + `HydrationData`）
3. **Home page SSG 步骤**：无条件写入 `dist/en/index.html`（包含 Hero + Features HTML + `HomeHydrationData`）

**结果**：`dist/en/index.html` 始终是 Home page 内容，文档索引页 (`/:lang/index`) 在 SSG 中丢失。

### 6.3 运行时影响

- **`/:lang`（如 `/en`）**：SSG 文件包含 Home page 内容 → React hydrate 到 `LangHomePage` + `HomePage` → 水合匹配 ✓
- **`/:lang/index`（如 `/en/index`）**：SPA 导航时 `fetchDocPage("en", "index")` 在 prod 模式请求 `dist/en/index.html` → 提取到 `HomeHydrationData`（无 `frontmatter`）→ `fetchDocPage` 将其提升为 `DocPageData`（title/description 来自 home，无 headings）→ 渲染为文档页但内容不对 ✗

---

## 7 Fix Plan

### 7.1 主要修复：Home page SSG 写入前检查文件存在性

**文件**：`src/plugins/vite-plugin-easydoc.ts`

**位置**：`closeBundle` 函数，Home page SSG 循环内

**修改逻辑**：在写入 `dist/<lang>/index.html` 之前，使用 `fs.existsSync` 检查文件是否已存在（由文档 SSG 步骤生成）。若已存在，则该语言有 `docs/<lang>/index.md`，跳过 Home page SSG 写入并打印相应日志。

**伪代码**：
```
for (const lang of locales) {
  const localeIndexPath = path.join(distDir, lang, 'index.html');

  if (fs.existsSync(localeIndexPath)) {
    // 文档 SSG 步骤已生成此文件（docs/<lang>/index.md 存在）
    console.log('skip home page SSG for lang, doc index already exists');
    continue;
  }

  // ... 现有 Home page 生成和写入逻辑 ...
}
```

**注意**：默认 locale 的 `dist/index.html` 写入也需要相应保护 — 如果 `dist/<defaultLocale>/index.html` 已被文档 SSG 生成，则 `dist/index.html` 也不应被 Home page 覆盖。

### 7.2 可选改进：`docs/<lang>/index.md` 输出路径重构

**问题**：当前 `docs/<lang>/index.md` 的 SSG 输出路径为 `dist/<lang>/index.html`，与 `/:lang`（Home page 路由）共用同一文件。理想情况下，两个路由应有独立的 SSG 文件：

| 路由 | 组件 | 期望 SSG 输出 |
|---|---|---|
| `/:lang` | `LangHomePage` (Home page) | `dist/<lang>/index.html` |
| `/:lang/index` | `DocPage` (doc index) | `dist/<lang>/index/index.html` |

**涉及改动**：

1. **`vite-plugin-easydoc.ts` `closeBundle`** — SSG 输出路径逻辑：
   - `collectAllSsgEntries` 中 `docs/<lang>/index.md` 的 `docPath` 从 `""` 改为 `"index"`
   - 或者：在写入循环中，当 `docPath === ''` 时输出到 `dist/<lang>/index/index.html` 而非 `dist/<lang>/index.html`

2. **`docService.ts` `fetchDocPage`** — 生产模式 URL 构造：
   - `path === 'index'` 时请求 `/${lang}/index/index.html`（而非 `/${lang}/index.html`）

3. **`applySsgTransform`** — `outputPath` 计算：
   - `entry.docPath` 为 `"index"` 时 `outputPath` = `"en/index"`（用于 prev/next 匹配和水合数据 path 字段）

4. **`useDocData.ts`** — 水合数据路径匹配：
   - `fullPath` 计算：`path === 'index'` 时 `fullPath = "${lang}/index"`（匹配新的 hydration data path 格式）

**影响评估**：
- 路由 `/:lang/index` 可获得正确的 SSG 预渲染（静态部署时直接访问）
- `/:lang` 始终渲染 Home page，无水合不匹配
- 向后兼容：如果 `docs/<lang>/index.md` 不存在，`/:lang` 的 SSG 仍为 Home page
- 需要同时修改 3-4 个文件中的路径约定

---

## 8 API / Data Layer 验证

### 8.1 `fetchDocPage("en", "index")` — Dev 模式

```
fetch("/api/doc/en/index")
→ lang="en", docPath="index"
→ modulePath="en/index"
→ resolveMdFile("en/index") → path.join(docsRoot, "en", "index.md")
→ 文件存在 ✓
→ compiler.compile(raw) → 返回 DocPageData
```

**结论**：Dev 模式正确 ✓

### 8.2 `fetchDocPage("en", "index")` — Prod 模式（当前代码）

```
path === 'index' → fetch("/en/index.html")
→ 获取 dist/en/index.html
→ extractHydrationData() 提取 JSON
→ 若文件被 Home page SSG 覆盖：得到 HomeHydrationData（无 frontmatter）
→ 进入 Home page shape 分支 → 提升 title/description 为 frontmatter
→ 返回 DocPageData（但内容为 Home page HTML，不是文档）✗
```

**结论**：Prod 模式在修复前有缺陷 ✗（主要修复可解决此问题）

### 8.3 `fetchDocPage("en", "index")` — Prod 模式（修复后，仅主要修复）

```
path === 'index' → fetch("/en/index.html")
→ 获取 dist/en/index.html（文档 SSG 内容，因 Home page 被跳过）
→ extractHydrationData() 提取 JSON
→ 得到 HydrationData（有 frontmatter）
→ 进入 Doc page shape 分支 → 正确映射
→ 返回 DocPageData ✓
```

**结论**：主要修复后 Prod 模式正确 ✓

---

## 9 `docService.ts` `extractHydrationData` 健壮性

当前 `extractHydrationData` 使用手动 brace-counting 解析 JSON，正确处理了嵌套对象和字符串转义。无需修改。

---

## 10 Conventions

- 修改文件：仅 `src/plugins/vite-plugin-easydoc.ts` 的 `closeBundle` 方法
- 不改动路由、组件、类型、hook、service
- 日志输出格式遵循现有约定：`[vite-plugin-easydoc] SSG home page skipped: ...`
- 使用 `fs.existsSync` 进行文件存在性检查（与插件中其他位置一致）