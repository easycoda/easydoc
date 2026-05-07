# SSR 渲染架构设计

## 1. 概述

当前项目 EasyCoda 在 Vite 构建流程的 `closeBundle` 阶段，通过 `src/plugins/ssg-layout.ts`（约 290 行）以手工字符串拼接方式生成与 React 组件相同 DOM 结构的静态 HTML。这导致项目维护两套 UI 渲染代码：客户端 React 组件（`Header.tsx`、`DocSidebar.tsx`、`Footer.tsx`、`Layout.tsx` 等）和构建时手工拼接（`ssg-layout.ts`）。

**本方案目标**：用 `react-dom/server` 的 `renderToString` 在构建时替换手工字符串拼接，使 React 组件成为唯一的 UI 真相源（Single Source of Truth）。

## 2. 技术选型：Node 环境中运行 JSX/TSX

### 2.1 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| `tsx` (npm 包) | 开箱即用，支持 TSX/ESM | 引入额外依赖，增加构建时间 |
| Vite `ssrLoadModule` | 复用 Vite 自身的转换管道，无需额外依赖 | API 在 `closeBundle` 阶段受限 |
| 手动调用 Vite SSR `createServer` | 完整控制 | 过度工程化 |

### 2.2 最终选型：`tsx` + 独立 SSR 入口

**理由：**

1. **当前项目已使用 ESM 格式**（`"type": "module"`），`vite.config.ts` 已能在 Node 中执行
2. `tsx` 是轻量级工具，在 Node 中提供 TypeScript + JSX 的即时转译能力，无需预构建
3. Vite 插件的 `closeBundle` 钩子在 Rollup 构建完成后触发，此时已无法使用 Vite 的 SSR 模块加载 API
4. `tsx` 允许我们在 `closeBundle` 中直接 `import` React 组件，与客户端代码共享完全一致的组件树

**实现方式**：
- 在 `closeBundle` 中，使用动态 `import()` 加载 SSR 入口模块（`src/ssr/ssg-entry.tsx`）
- `tsx` 会在 Node 进程中实时转译 `.tsx` 文件
- 无需修改 `package.json` scripts — `tsx` 仅用于开发依赖的运行时转译

**不需要安装额外的 npm 包**：Vite 本身及其插件系统在 Node 环境中运行 JSX/TSX 的能力可以通过 `tsx` 在已有依赖中实现 — 需要时可在 `devDependencies` 中添加 `tsx`。

实际上，更优方案：**在 `closeBundle` 所在文件中直接使用 `tsx` 的 register API** 或**利用 Vite 自身的 ESM 转译能力**。具体来说：

> 最终推荐方案：在 `vite-plugin-easydoc.ts` 的 `closeBundle` 中，使用 Vite 的 `ssrLoadModule` API（Vite 配套的内部 server）来加载 SSR 入口模块。Vite 在构建过程中维护了一个内部模块图，`ssrLoadModule` 可以正确解析和转译 TSX 文件。

**修正后的实现方案：**
- 在 `closeBundle` 中，使用 Vite 构建过程中挂载在 plugin 上下文中的模块加载能力
- 或者更简单：直接用 `tsx` 在 devDependencies 中，通过动态 import 加载 TSX 模块
- 关键约束：`tsx` 必须能解析 `@/` 别名 → 使用 `tsconfig-paths` register 或手动 resolve

### 2.3 最终确定方案：Vite 插件内联 SSR 渲染

经过分析，最简洁且无需额外依赖的方式：

1. **不引入 `tsx`** — 避免额外依赖和配置复杂度
2. **在 `vite-plugin-easydoc.ts` 的 `closeBundle` 中，使用 Node.js 原生的 `module` API 或直接构造一个最小化的 SSR 环境**
3. **关键突破**：`react-dom/server` 的 `renderToString` 可以直接在 Node.js 中调用，只要 JSX 能正确转译

**实际落地策略**：在 `src/ssr/` 目录下创建纯逻辑渲染函数（不包含 JSX），这些函数接收数据参数并返回 `React.createElement` 调用，从而绕过 JSX 转译问题。但这会失去"复用组件"的优势。

**最终推荐方案 — 使用 `tsx` 作为 devDependency**：

```json
// package.json devDependencies 添加
"tsx": "^4.x"
```

在 `vite-plugin-easydoc.ts` 的 `closeBundle` 钩子中：

```typescript
// closeBundle 内部
import { renderToString } from 'react-dom/server';
// 使用 tsx 的运行时转译能力 — 通过动态 import
const { createSsgElementTree } = await import('../ssr/ssg-entry');
const html = renderToString(createSsgElementTree({...}));
```

> **注意**：`tsx` 需要在 Node 进程启动时注册。当前 `vite build` 命令通过 Vite CLI 启动，Vite 内部已经使用了类似机制处理 `vite.config.ts`。`tsx` 可以作为可选依赖，通过 `NODE_OPTIONS="--import tsx"` 或代码内 `tsx.register()` 启用。

## 3. SSR 渲染流程

### 3.1 构建 Pipeline（变更后）

```
① Markdown → HTML (markdown-it) — 不变
② 准备 SSR 渲染上下文：
   - 从 manifest 读取 navigation 数据
   - 从 translations 读取 UI 文本
   - 从 entry 读取当前页面数据和 hydration data
③ 构造 Provider 树（StaticRouter → QueryClientProvider → ThemeProvider → TooltipProvider → SidebarProvider）
④ renderToString(<ProviderTree><Layout /></ProviderTree>)
   → 得到完整的布局壳 HTML（替代原 ssg-layout.ts 的手工拼接）
⑤ 注入 hydration script + SEO meta — 沿用现有逻辑（ssg-home.ts 的 buildSeoMetaString）
⑥ 写入 dist/<lang>/<path>.html
```

### 3.2 数据流

```
Manifest (DocManifest) ──┐
Translations (Record)  ──┤
SsgPageEntry (html+meta)──┼──→ SSR 渲染上下文 ──→ renderToString ──→ 完整 HTML
SiteConfig              ──┤
HydrationData           ──┘
```

### 3.3 组件树结构（SSR 渲染时）

```
<StaticRouter location={currentPath}>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" disableTransitionOnChange={false}>
      <TooltipProvider>
        <SidebarProvider defaultOpen={isDocPage} isMobile={false}>
          <Layout />
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
</StaticRouter>
```

其中 `<Layout />` 内部会自动渲染：
- `<Header showSidebarTrigger={isDocPage} />`
- `<DocSidebar manifest={manifest} currentPath={currentPath} />`（仅 doc 页面）
- `<SidebarInset>` + `<main>` + `<Outlet />`（即 DocContent 或 Home 内容）
- `<TocSidebar headings={headings} />`（仅 doc 页面）
- `<Footer />`

## 4. 需要解决的技术问题

### 4.1 react-router-dom：BrowserRouter vs StaticRouter

**问题**：客户端使用 `createBrowserRouter`（`src/router.tsx`），该 API 依赖浏览器 History API，Node 中不可用。

**解决方案**：
- SSR 入口不使用 `src/router.tsx` 中的 `createBrowserRouter`
- 改用 `StaticRouter`（从 `react-router-dom` 导入）包裹组件树
- `StaticRouter` 接受 `location` prop 传入当前 URL 路径

**注意**：`Layout` 组件内部使用了 `useLocation()`、`useParams()`、`<Outlet />`。在 `StaticRouter` 下的行为：
- `useLocation()` → 返回 `StaticRouter` 的 `location`
- `useParams()` → 需要 URL 路径匹配路由模式 `/:lang/*`
- `<Outlet />` → 需要正确的路由上下文

**关键问题**：`StaticRouter` 不提供路由匹配（无 `<Routes>` / `<Route>` 嵌套），`<Outlet />` 不会工作。

**解决方案**：SSR 入口需要显式构建包含 `<Routes>` 的组件树，或将 `<Outlet />` 替换为直接渲染的页面内容。

具体做法：
```tsx
<StaticRouter location={currentPath}>
  <Routes>
    <Route element={<SsgLayout />}>
      <Route index element={<DocContent html={entry.html} ... />} />
    </Route>
  </Routes>
</StaticRouter>
```

或者更简洁：在 SSR 入口中不使用 `<Outlet />`，而是直接传递文档内容 HTML 作为 children，SSR 版本的 Layout 直接渲染。

### 4.2 shadcn/ui SidebarProvider & useIsMobile

**问题**：`SidebarProvider` 和 `useIsMobile` 依赖 `window.matchMedia`、`window.innerWidth`，Node 中不可用。

**解决方案**：
- SSR 时硬编码 `isMobile = false`（桌面端渲染模式）
- `SidebarProvider` 的 `defaultOpen` 设为 `true`（doc 页面）或 `false`（home 页面）
- 在 SSR 入口中不调用 `useIsMobile()` hook — 改为传递一个显式的 `isMobile` prop 或 context

**具体实现**：
- 在 SSR Layout 包装中，提供一个 SSR 专用的 `MobileContext`，其值固定为 `false`
- 或更简单：修改 `useIsMobile` hook 使其在 `typeof window === 'undefined'` 时返回 `false`
- `SidebarProvider` 的无浏览器环境表现：shadcn 的 `SidebarProvider` 内部使用 CSS 变量和 React state，不直接依赖浏览器 API（除了 `useIsMobile`）。需要检查 `src/components/ui/sidebar.tsx` 中的具体实现。

### 4.3 ThemeProvider（next-themes）

**问题**：`ThemeProvider`（`src/components/theme-provider.tsx`）在初始化时访问 `localStorage` 和 `window.matchMedia`。

**解决方案**：
- SSR 入口使用 `ThemeProvider` 时传入 `defaultTheme="light"`，确保不访问 `localStorage`
- ThemeProvider 的 `useEffect` 逻辑在 SSR 时不执行（React 19 的 `renderToString` 不执行 effects）
- `disableTransitionOnChange={false}` — SSR 下无需 transition 禁用

### 4.4 @tanstack/react-query

**问题**：TanStack Query 的 `QueryClientProvider` 在 Node 中可能依赖浏览器 API（如 `window.fetch`）。

**解决方案**：
- 创建空的 `QueryClient`（不发起实际请求）
- SSR 渲染不需要实际数据获取 — 所有数据已在渲染上下文准备就绪
- `Layout` 组件中的 `useQuery({ queryKey: docKeys.manifest(lang), ... })` 在 SSR 时不应触发。通过传入 `enabled: false` 或使用已预填充的 `queryClient` 解决
- 更好的方案：在 `QueryClient` 中 `setQueryData` 预填充 manifest 数据，这样 `useQuery` 在 SSR 时直接使用缓存数据

**具体实现**：
```typescript
const queryClient = new QueryClient();
queryClient.setQueryData(docKeys.manifest(lang), manifest);
queryClient.setQueryData(docKeys.doc(lang, docPath), docPageData);
```

这样 `Layout` 中的 `useQuery` 会直接从缓存读取数据，不发起请求。

### 4.5 CSS / Tailwind

**问题**：`renderToString` 不包含 `<style>` 标签，HTML 缺少 CSS。

**解决方案**：
- **不需要在 Node 中生成 CSS**。Vite 构建已生成 `dist/assets/*.css` 文件
- SSR 生成的 HTML 直接使用与客户端相同的 Tailwind 类名
- CSS 通过 Vite 构建的 `index.html` 中的 `<link>` 标签加载
- 保持不变：SSG HTML 被注入 `dist/index.html` 模板中，模板已包含 Vite 注入的 CSS 链接

### 4.6 lazy() + Suspense

**问题**：客户端 `router.tsx` 使用 `lazy()` 和 `Suspense` 进行代码分割，SSR 时 `Suspense` 的 fallback 会被渲染。

**解决方案**：
- SSR 入口**不使用**客户端路由配置
- SSR 入口直接 import 页面组件（同步 import），不使用 `lazy()`
- 构建一个 SSR 专用组件树，其中包含直接渲染的 `DocContent` 或 `HomePage`

### 4.7 `<head>` 管理

**现状**：`renderToString` 只渲染 `<div id="root">` 内容。`<title>`、`<meta>` 标签由 `buildSeoMetaString`（`src/plugins/ssg-home.ts`）生成并注入 `index.html` 模板。

**保持不变**：
- SEO meta 生成逻辑不变（`ssg-home.ts` 中的 `buildSeoMetaString`、`buildHomeSeoMeta`）
- `applySsgTransform` 中的 `<title>` 替换逻辑不变
- `hydrationScript` 注入逻辑不变

## 5. 文件结构设计

### 5.1 新建文件

#### `src/ssr/ssg-render.tsx` — SSR 渲染核心

**职责**：提供两个纯函数，接收渲染上下文数据，返回完整的 HTML 字符串。

```typescript
// 函数签名（仅类型）
export function renderDocPageToString(
  entry: SsgPageEntry,
  manifest: DocManifest,
  translations: Record<string, string>,
  siteConfig: SiteConfig,
  currentPath: string,
  hydrationData: HydrationData,
): string;

export function renderHomePageToString(
  homeHtml: string,
  translations: Record<string, string>,
  siteConfig: SiteConfig,
  lang: string,
): string;
```

**内部实现要点**：
1. 创建 `QueryClient` 并预填充数据
2. 组装 Provider 树
3. 调用 `renderToString`
4. 返回完整 HTML

#### `src/ssr/ssg-layout.tsx` — SSR 专用 Layout 组件

**职责**：SSR 环境下的 Layout 组件。与客户端 `Layout.tsx` 的区别：
- 不依赖 `useLocation()`（路由信息通过 props 传递）
- 不依赖 `useParams()`（语言通过 props 传递）
- 不调用 `useIsMobile()`（固定为桌面模式）
- 不发起 TanStack Query 请求（数据通过 `queryClient` 预填充）
- 不包含 `<Outlet />`（直接渲染 children）

```typescript
interface SsgLayoutProps {
  children: React.ReactNode;
  lang: string;
  currentPath: string;
  onDocPage: boolean;
  manifest?: DocManifest;
  headings?: TocHeading[];
  activeHeadingId?: string;
}
```

### 5.2 修改文件

#### `src/plugins/vite-plugin-easydoc.ts`

**变更**：`closeBundle` 钩子中：
- 移除 `renderDocLayout()` 和 `renderHomeLayout()` 调用
- 改为调用 `renderDocPageToString()` 和 `renderHomePageToString()`
- 其他逻辑（SEO meta、hydration script、文件写入）保持不变

#### `src/plugins/ssg-layout.ts`

**变更**：**删除整个文件**（约 290 行）。所有功能由 SSR 渲染接管。

#### `src/hooks/useDocData.ts`

**变更**：`consumeHydrationData()` 函数逻辑不变，但在 SSR 场景（Node 环境）中不会被调用。

#### `src/components/Layout.tsx`

**可能变更**：如果 `useIsMobile()` hook 在 SSR 时会出问题，需要在 hook 层面添加 `typeof window === 'undefined'` 守卫。

#### `src/hooks/use-mobile.ts`

**变更**：添加 SSR 安全守卫：
```typescript
export function useIsMobile() {
  // SSR guard
  if (typeof window === 'undefined') return false;
  // ... 原有逻辑
}
```

#### `vite.config.ts`

**可能变更**：无需显式修改。但需确保 SSR 渲染时 `@/` 别名可正确解析。

### 5.3 不修改的文件（确认无影响）

| 文件 | 说明 |
|------|------|
| `src/main.tsx` | 客户端入口，不受影响 |
| `src/App.tsx` | 客户端入口，不受影响 |
| `src/router.tsx` | 客户端路由，SSR 不使用 |
| `src/pages/Doc.tsx` | 客户端 doc 页面，不受影响 |
| `src/pages/Home.tsx` | 客户端 home 页面，不受影响 |
| `src/plugins/ssg-home.ts` | SEO meta 生成，保持不变 |
| `src/components/DocContent.tsx` | 客户端组件，不受影响 |
| `src/components/DocSidebar.tsx` | SSR 会直接复用此组件 |
| `src/components/Header.tsx` | SSR 会直接复用此组件 |
| `src/components/Footer.tsx` | SSR 会直接复用此组件 |
| `src/services/docService.ts` | 数据服务，保持不变 |
| `src/types/*` | 类型定义，可能需新增少量类型 |

## 6. 渲染上下文数据流

### 6.1 Doc 页面渲染流程

```
SsgPageEntry (html, headings, frontmatter, lang, docPath, modulePath)
    │
    ├──→ HydrationData (window.__HYDRATION_DATA__)
    │     · lang, path, frontmatter, html, headings, prev?, next?
    │
    ├──→ QueryClient pre-fill
    │     · docKeys.manifest(lang) → DocManifest
    │     · docKeys.doc(lang, docPath) → DocPageData
    │
    └──→ renderDocPageToString()
          │
          ├── StaticRouter(location=currentPath)
          │   └── QueryClientProvider(client)
          │       └── ThemeProvider
          │           └── TooltipProvider
          │               └── SidebarProvider(defaultOpen=true, isMobile=false)
          │                   └── SsgLayout(onDocPage=true, ...)
          │                       ├── Header(showSidebarTrigger=true)
          │                       ├── DocSidebar(manifest, currentPath)
          │                       ├── SidebarInset
          │                       │   └── DocContent(html, headings, ...)
          │                       ├── TocSidebar(headings, ...)
          │                       └── Footer()
          │
          └──→ renderToString() → 完整 HTML 字符串
               │
               └──→ 注入 index.html 模板（applySsgTransform）
```

### 6.2 Home 页面渲染流程

```
Translations + SiteConfig + homeHtml
    │
    ├──→ QueryClient pre-fill
    │     · （home 页面不需要 manifest）
    │
    └──→ renderHomePageToString()
          │
          ├── StaticRouter(location=`/${lang}`)
          │   └── QueryClientProvider(client)
          │       └── ThemeProvider
          │           └── TooltipProvider
          │               └── SidebarProvider(defaultOpen=false, isMobile=false)
          │                   └── SsgLayout(onDocPage=false, ...)
          │                       ├── Header(showSidebarTrigger=false)
          │                       ├── HeroSection()
          │                       ├── FeatureCards()
          │                       └── Footer()
          │
          └──→ renderToString() → 完整 HTML 字符串
```

## 7. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| `renderToString` 在 Node 中不可用 | 阻塞 | React 19 的 `react-dom/server` 原生支持 Node.js |
| shadcn/ui 组件内部使用浏览器 API | 渲染崩溃或输出不完整 | SSR 入口提供 polyfill 或 mock；添加全局守卫 |
| `StaticRouter` 不支持 `useParams()` | Layout 组件逻辑异常 | SSR 入口显式传递 lang/path 作为 props，不依赖路由 hooks |
| Tailwind 类名在 SSR HTML 中正确但 CSS 不匹配 | 样式错乱 | CSS 由 Vite 构建产物提供，类名一致则正确 |
| `tsx` 转译兼容性问题 | 构建失败 | 在 CI 中添加 SSR 渲染的 smoke test |
| 构建时间增加 | 影响 DX | `renderToString` 调用次数等于页面数量（通常几十到几百），影响可控 |

## 8. 目录结构（变更后）

```
src/
  ssr/                  # 新增目录
    ssg-render.tsx      # SSR 渲染核心
    ssg-layout.tsx      # SSR 专用 Layout 组件
  plugins/
    ssg-layout.ts       # 删除
    ssg-home.ts         # 不变
    vite-plugin-easydoc.ts  # 修改 closeBundle
  components/
    Layout.tsx          # 微调（SSR 安全守卫）
    ...
  hooks/
    use-mobile.ts       # 微调（SSR 安全守卫）
    ...
```