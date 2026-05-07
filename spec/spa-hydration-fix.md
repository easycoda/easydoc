# SPA 导航水合数据修复 – 技术规格

## 1 概述

在生产环境中，用户通过 React Router 在文档页面之间进行 SPA 导航时，`useDocData.ts` 无法获取有效的 `initialData`。原因是：

1. **路径格式不匹配**：`useDocData` 的匹配条件 `hydrated.current.path === path` 永远不成立——SSG 生成的水合数据中 `path` 是 `"en/guide/getting-started"` 格式（含语言前缀），而 `Doc.tsx` 传入的 `resolvedPath` 是 `"guide/getting-started"` 格式（不含语言前缀）。即使首次加载命中 SSG 生成的 HTML，hydration data 也永远不会被用作 `initialData`。

2. **生产环境 `fetchDocPage()` 使用 `import()` 加载虚拟模块**：在 dev 模式下走 HTTP `/api/doc/` 端点，这是正常的；但在 production 模式下走 `import(/* @vite-ignore */ 'virtual:easydoc-doc:en/guide/...')` ——虚拟模块只在构建时存在，生产 bundle 中没有对应的 chunk，导致动态 import 失败。

3. **生产环境 `fetchDocManifest()` 同样的问题**：使用 `import()` 加载虚拟模块 `virtual:easydoc-manifest:<lang>`，生产环境不可用。

### 解决策略

**改用 `fetch()` 加载 SSG 已生成的 HTML 文件**，从中提取 `window.__HYDRATION_DATA__`。每个 SSG 页面（`dist/<lang>/<path>/index.html`）已内嵌了完整的水合数据脚本，无需额外构建产物。同时修正 `useDocData` 的路径比较逻辑。

---

## 2 架构：SSG vs SPA 导航数据流

### 2.1 首次加载（SSG 页面直接访问）

```
浏览器请求 GET /en/guide/getting-started/
  │
  ▼
服务器返回 dist/en/guide/getting-started/index.html
  │
  ├── <div id="root">[预渲染的文档HTML]</div>    ← 搜索爬虫可见
  ├── <script>window.__HYDRATION_DATA__ = {
  │       lang: "en",
  │       path: "en/guide/getting-started",      ← 含语言前缀的完整路径
  │       html: "...",
  │       frontmatter: {...},
  │       headings: [...],
  │       prev: {...}, next: {...}
  │     }</script>
  └── <script src="/assets/index-xxx.js"></script>
  │
  ▼
React 加载，hydrateRoot 挂载事件监听器
  │
  ├── useDocData("en", "guide/getting-started") 调用
  ├── consumeHydrationData() 读取 window.__HYDRATION_DATA__
  ├── 比较 hydrated.lang(="en") === lang(="en") ✓
  │     hydrated.path(="en/guide/getting-started") === path(="guide/getting-started") ✗  ← BUG
  │
  └── 未命中 → TanStack Query 发起 fetchDocPage("en", "guide/getting-started")
        │
        └── fetch() 请求 GET /en/guide/getting-started/index.html
              └── 解析 HTML → 提取 __HYDRATION_DATA__ → 返回 DocPageData
```

### 2.2 SPA 导航（客户端路由切换）

```
用户点击侧边栏链接 → React Router 导航至 /en/guide/installation
  │
  ▼
DocPage 重新渲染，useDocData("en", "guide/installation") 触发
  │
  ├── window.__HYDRATION_DATA__ 已被 consumeHydrationData() 清除 → undefined
  └── TanStack Query 发起 fetchDocPage("en", "guide/installation")
        │
        ├── DEV:  fetch("/api/doc/en/guide/installation") → JSON  ← 正常
        └── PROD: import("virtual:easydoc-doc:en/guide/installation") → FAIL ✗  ← 修复目标
                    │
                    └── 改为: fetch("/en/guide/installation/index.html")
                          └── 解析 HTML → 正则提取 __HYDRATION_DATA__ → JSON.parse → DocPageData
```

### 2.3 Manifest 加载流程

```
Layout 组件挂载，onDocPage = true
  │
  └── useQuery → fetchDocManifest("en")
        │
        ├── DEV:  fetch("/manifest-en.json") → JSON ← 正常
        └── PROD: import("virtual:easydoc-manifest:en") → FAIL ✗  ← 修复目标
                    │
                    └── 改为: fetch("/manifest-en.json")
                          └── buildEnd 已将该文件作为 asset 输出到 dist/manifest-en.json
```

---

## 3 实现方案

### 3.1 `src/services/docService.ts` — 修改 production 分支

**`fetchDocPage(lang, path)` 生产模式改动：**

将 `import()` 虚拟模块的逻辑替换为 `fetch()` HTML 文件 + 正则提取水合数据：

```
生产模式:
  1. 构造 URL: `/${lang}/${path}/index.html`
     注意：`path` 参数是 resolvedPath，即 "guide/getting-started" 或 "index"
     当 path === "index" 时，URL 为 `/${lang}/index.html`（语言首页）
  2. fetch(url) 获取 HTML 文本
  3. 使用正则 /window\.__HYDRATION_DATA__\s*=\s*(\{.*?\});/s 提取 JSON
  4. JSON.parse 得到 HydrationData
  5. 将 HydrationData 映射为 DocPageData 返回：
     {
       html: data.html,
       frontmatter: { title, description, order },
       headings: data.headings,
       lang: data.lang,
       path: resolvedPath,  // ← 使用调用者传入的 path，保持格式一致
       prev: data.prev,
       next: data.next,
     }
  6. 如果 fetch 返回 404，抛出错误（由 TanStack Query 处理）
```

**`fetchDocManifest(lang)` 生产模式改动：**

将 `import()` 虚拟模块替换为 `fetch()` 静态 JSON 文件：

```
生产模式:
  1. fetch(`/manifest-${lang}.json`)
  2. 解析为 DocManifest 返回
  3. 该文件由 buildEnd 钩子输出到 dist/manifest-<lang>.json
```

**`fetchSearchIndex()` — 无需修改**，已经使用 `fetch('/search-index.json')`。

### 3.2 `src/hooks/useDocData.ts` — 修正路径匹配

**问题根因：**

- `consumeHydrationData()` 返回的 `hydrationData.path` = `"en/guide/getting-started"`（含语言前缀）
- `useDocData(lang, path)` 中 `path` = `"guide/getting-started"`（不含语言前缀）
- 匹配条件 `hydrated.current.path === path` 永不成立

**修复方案（Option A — 推荐）：**

构造 `fullPath` 与 hydration data 的 path 格式保持一致：

```typescript
// 构造与 HydrationData.path 一致的完整路径
// HydrationData.path 格式: "<lang>" (首页) 或 "<lang>/<docPath>" (文档页)
const fullPath = path === 'index' ? lang : `${lang}/${path}`;

// 在匹配条件中使用 fullPath
...(hydrated.current &&
  hydrated.current.lang === lang &&
  hydrated.current.path === fullPath
  ? { initialData: { ... } }
  : {}),
```

同时，`initialData.path` 字段应使用 `resolvedPath`（即调用者传入的 `path`），以保持 `DocPageData.path` 语义一致（不含语言前缀的剩余路径）。

### 3.3 `src/plugins/vite-plugin-easydoc.ts` — 无需修改

验证确认：

- `closeBundle` 已正确生成 `dist/<lang>/<docPath>/index.html`，内嵌 `window.__HYDRATION_DATA__`
- `buildEnd` 已正确输出 `manifest-<lang>.json` assets
- 无需改动

### 3.4 `src/pages/Doc.tsx` — 无需修改

`Doc.tsx` 的 `resolvedPath = splat || 'index'` 逻辑保持不变。修复在 `useDocData` 内部完成。

### 3.5 `src/components/Layout.tsx` — 首页水合验证

Layout 组件本身不直接消费 `__HYDRATION_DATA__`。首页 hydration data 的消费路径：

- 用户访问 `/en` → 服务器返回 `dist/en/index.html`（内含 `HomeHydrationData`）
- `HomeHydrationData` 也通过 `window.__HYDRATION_DATA__` 注入
- `LangHomePage` 渲染 `HomePage`，`HomePage` 渲染 `HeroSection` + `FeatureCards`
- 首页组件不调用 `useDocData`，因此不依赖 hydration 逻辑
- 预渲染的 HTML 直接可见，React hydrate 后挂载事件监听器

**结论：Layout 和首页 hydration 无需修改。** 首页 SSG 输出和 hydration 逻辑是独立的，不受此次修改影响。

---

## 4 边界情况处理

### 4.1 404 页面（文档不存在）

场景：SPA 导航到不存在的文档路径，如 `/en/nonexistent/page`

处理流程：
1. `fetchDocPage("en", "nonexistent/page")` → `fetch("/en/nonexistent/page/index.html")`
2. 服务器返回 404（静态文件不存在）
3. `fetch` 的 `res.ok` 为 false → 抛出错误
4. TanStack Query 捕获错误 → `useDocData` 返回 `error`
5. `DocPage` 渲染 404 错误界面（现有逻辑已有 `if (error || !data)` 分支）

**无需额外处理。**

### 4.2 语言首页（`/:lang`）

场景：访问 `/en`（语言首页，非文档页）

- `LangHomePage` 组件渲染 → 不调用 `useDocData`
- 如果已加载的 hydration data 是 `HomeHydrationData`，`consumeHydrationData()` 会消费它
- `HomeHydrationData` 类型与 `HydrationData` 不同，但 `window.d.ts` 中 `__HYDRATION_DATA__` 类型是 `HydrationData`

**需要处理：** `window.d.ts` 的类型需要包含 `HomeHydrationData`，或者在 `consumeHydrationData` 中做类型宽松处理。当前实际代码中 `window.__HYDRATION_DATA__` 声明类型为 `HydrationData`，但首页注入的是 `HomeHydrationData`。这不会导致运行时错误（TypeScript 只做编译时检查），但类型不准确。

**建议：** 将 `window.__HYDRATION_DATA__` 的类型改为 `HydrationData | HomeHydrationData | undefined`。

### 4.3 语言切换

场景：用户从 `/en/guide/intro` 切换到 `/zh/guide/intro`

1. React Router 导航至新路径
2. `DocPage` 重新渲染，`lang="zh"`, `resolvedPath="guide/intro"`
3. `useDocData("zh", "guide/intro")` 触发
4. `consumeHydrationData()` 返回 undefined（上次的水合数据已消费且 lang 不匹配）
5. TanStack Query 调用 `fetchDocPage("zh", "guide/intro")` → `fetch("/zh/guide/intro/index.html")`
6. 获取并返回中文文档数据

**正常流程，无需特殊处理。**

### 4.4 并发导航（快速连续点击）

场景：用户快速点击多个侧边栏链接

1. 每次导航触发新的 `useQuery`
2. TanStack Query 按 `queryKey: ['doc', lang, path]` 区分查询
3. 前一个查询可能被取消（React Router 导航导致组件卸载或 key 变化）
4. `fetch()` 请求可能被浏览器自动取消或忽略
5. **需要注意：** `consumeHydrationData()` 在首次调用后清除 `window.__HYDRATION_DATA__`，后续导航不再有水合数据，走正常 fetch 路径

**正常流程，TanStack Query 自带请求去重和取消机制。**

### 4.5 HTML 解析失败

场景：`fetch()` 返回的 HTML 中不包含 `__HYDRATION_DATA__` 脚本（例如 CDN 返回错误页面）

处理：
1. 正则匹配失败 → `hydrationMatch` 为 null
2. 抛出描述性错误：`"Hydration data not found in HTML for /en/guide/page"`
3. TanStack Query 进入 error 状态
4. `DocPage` 渲染错误界面

### 4.6 JSON 解析失败

场景：`__HYDRATION_DATA__` 脚本存在但 JSON 格式损坏

处理：
1. `JSON.parse` 抛出 `SyntaxError`
2. `fetchDocPage` 捕获后重新抛出带描述的错误
3. 同上 → 错误界面

---

## 5 类型改动

### 5.1 `src/types/window.d.ts`

```typescript
import type { HydrationData, HomeHydrationData } from './hydration';

declare global {
  interface Window {
    __HYDRATION_DATA__?: HydrationData | HomeHydrationData;
  }
}

export {};
```

### 5.2 `src/types/hydration.ts`

```typescript
// HomeHydrationData 中 path 类型收窄
export interface HomeHydrationData {
  lang: string;
  path: '';  // 首页 path 始终为空字符串（区别于 HydrationData 的完整路径格式）
  title: string;
  description: string;
  html: string;
}
```

> 注意：SSG 插件中首页水合数据 `path` 设为 `''` 还是 `lang` 需要确认。查看 `closeBundle` 中首页 hydration 代码，`path: ''` 在 `HomeHydrationData` 接口中定义。但实际写入时 `homeHydrationData` 的 `path` 被设为 `''`。如果定为 `''`，则 `HomeHydrationData.path` 与 `HydrationData.path` 格式不同（后者是 `"<lang>/<docPath>"`），消费者需要区分。这是合理的——首页不是文档页，消费路径不同。

---

## 6 测试策略

### 6.1 单元测试场景

| 场景 | 输入 | 预期结果 |
|------|------|----------|
| 首次加载文档页（点击 SSG 页面） | `useDocData("en", "guide/intro")`，`window.__HYDRATION_DATA__` 存在且 path=`"en/guide/intro"` | `initialData` 被使用，无网络请求 |
| 首次加载语言首页 | `useDocData("en", "index")`，`window.__HYDRATION_DATA__` 存在且 path=`"en"` | `initialData` 被使用 |
| SPA 导航到另一个文档 | `useDocData("en", "guide/install")`，`window.__HYDRATION_DATA__` 已清除 | 发起 `fetch("/en/guide/install/index.html")` |
| 生产模式 fetch 成功 | `fetchDocPage("zh", "api/config")` | `fetch("/zh/api/config/index.html")` → 解析 → `DocPageData` |
| 生产模式 fetch 404 | `fetchDocPage("en", "nonexistent")` | `fetch` 返回 404 → 抛出错误 |
| HTML 中无水合脚本 | `fetchDocPage` 的响应 HTML 不含 `__HYDRATION_DATA__` | 抛出 "Hydration data not found" |
| Manifest 生产加载 | `fetchDocManifest("zh")` | `fetch("/manifest-zh.json")` → `DocManifest` |
| 语言切换后导航 | 先访问 `/en/doc1`，再点击切换到 `/zh/doc1` | `consumeHydrationData` 返回 undefined（已消费），走正常 fetch |

### 6.2 集成测试（手动验证清单）

1. **`vite build && vite preview`** — 构建生产包并本地预览
2. 直接访问 `/en/guide/getting-started/` → 页面立即显示内容，无闪烁
3. 点击侧边栏链接导航到另一文档 → 内容正确加载，URL 更新
4. 切换语言后点击文档 → 内容正确加载
5. 直接访问不存在的文档路径 → 显示 404 页面
6. 浏览器后退/前进按钮 → 页面正确恢复
7. `curl http://localhost:4173/en/guide/getting-started/` → 返回包含预渲染内容的 HTML（SEO 验证）

---

## 7 与现有规格文件的关系

- **`spec/routes.md`** — 路由不变
- **`spec/build-flow.md`** — 构建流程不变；修改的是运行时数据获取路径
- **`spec/types.md`** — `window.d.ts` 类型更新；`hydration.ts` 类型微调
- **`spec/state.md`** — 状态架构不变
- **`spec/api.md`** — API 层 `docService.ts` 生产模式实现变更
- **`spec/ssg-home-seo.md`** — SSG 产物格式不变，只是现在 SPA 导航也复用这些产物