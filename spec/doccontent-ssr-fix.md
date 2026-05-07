# DocContent SSR 渲染修复 — 技术规格

## 1 概述

修复 `DocContent` 组件在 SSR（Static Site Generation）构建流程中输出空白内容的问题。

**问题本质：** `DocContent` 组件使用 `useEffect` + 手动 `innerHTML` 赋值来渲染 Markdown HTML。但 `react-dom/server` 的 `renderToString` 只执行同步渲染，不会执行 `useEffect`，导致 SSG 输出的静态 HTML 中缺少文档正文内容。用户在首次加载 / 刷新页面时，会短暂看到空白区域，直到客户端 JavaScript 水合（hydrate）后 `useEffect` 执行才填充内容。

**修复目标：** 让 `DocContent` 在 SSR 环境下通过 `dangerouslySetInnerHTML` 内联渲染 HTML，在 CSR 环境下继续使用 `useEffect` + 手动 `innerHTML` 路径（以保护 Mermaid 图表不被 React 重渲染覆盖）。

---

## 2 环境检测机制

**检测方式：** 在组件函数体中检测 `typeof window === 'undefined'`。

| 环境 | `typeof window` | 渲染路径 | Mermaid 处理 |
|------|-----------------|----------|-------------|
| SSR (Node.js, `renderToString`) | `'undefined'` | `dangerouslySetInnerHTML` | 不处理（`useEffect` 不执行，`<code class="language-mermaid">` 保留在 HTML 中） |
| CSR (浏览器) | `'object'` | `useEffect` + 手动 `innerHTML` | 完整处理（懒加载 mermaid、初始化、图表渲染） |

**检测位置：** 在组件函数的 return 语句之前，根据检测结果分支到不同的 JSX 结构。两个分支共享同一个 `contentRef` 和相同的 `PROSE_CLASS`。

> **注意：** 不能在组件顶层（模块作用域）执行 `typeof window` 检测并缓存结果。虽然 Vite 在构建时会对模块作用域代码进行静态分析，但 `typeof window` 检测本身是运行时安全的，在组件函数体内执行可确保正确性。React 在 SSR 时调用组件函数，此时 `window` 确实为 `undefined`。

---

## 3 组件结构变更

### 3.1 修改文件

**仅修改一个文件：** `src/components/DocContent.tsx`

### 3.2 变更详细描述

#### 变更点 1：SSR 环境分支 — 渲染逻辑

在 `DocContent` 函数的 return 语句处，根据 `typeof window === 'undefined'` 分支渲染：

**SSR 路径 (`typeof window === 'undefined'` 为 `true`)：**

```
<article className="w-full max-w-none">
  <div
    ref={contentRef}
    className={PROSE_CLASS}
    dangerouslySetInnerHTML={{ __html: html }}
  />
</article>
```

- 使用 `dangerouslySetInnerHTML` 将 Markdown HTML 直接注入 `<div>`。
- `ref={contentRef}` 仍然绑定，但 SSR 中 `useRef` 创建的对象没有 `.current` 的 DOM 引用（`renderToString` 不执行 effects，ref 不会被附加）。
- `useEffect` 中的所有逻辑（Mermaid 初始化、headings 提取、IntersectionObserver、导航拦截）在 SSR 中不会执行。
- `<code class="language-mermaid">` 节点原样保留在 HTML 中，客户端水合后由 CSR 路径的 `useEffect` 处理。

**CSR 路径 (`typeof window === 'undefined'` 为 `false`)：**

保持现有渲染逻辑完全不变：

```
<article className="w-full max-w-none">
  <div
    ref={contentRef}
    className={PROSE_CLASS}
  />
</article>
```

#### 变更点 2：CSR 初始化守卫

在 `initializeContent` 回调函数（被 `useEffect` 调用）开头添加运行时守卫：

```
if (typeof window === 'undefined') return;
```

**理由：** 虽然 SSR 中 `useEffect` 不会被 `renderToString` 执行，但添加显式守卫可以：
1. 防范未来可能的 SSR 流式渲染（`renderToPipeableStream`）场景
2. 使代码意图更明确
3. 零成本（对 CSR 无影响）

#### 变更点 3：导航拦截 effect 守卫

在客户端导航拦截的 `useEffect` 中，`container.addEventListener` 之前添加守卫：

```
if (!container) return;  // 已有
if (typeof window === 'undefined') return;  // 新增 SSR 守卫
```

#### 变更点 4：注释更新

替换组件底部（`return` 之前的注释块）为新的说明注释：

```
// ── Render ─────────────────────────────────────────────────────────
// SSR (renderToString):  使用 dangerouslySetInnerHTML 内联渲染 HTML。
//                        useEffect 不执行，Mermaid 代码块原样保留。
// CSR (浏览器):          使用 useEffect + 手动 innerHTML 仅在 html
//                        实际变化时写入，保护 Mermaid SVG 不被 React
//                        重渲染覆盖。
```

---

### 3.3 保持不变的部分

以下代码和逻辑**完全不变**：

| 区域 | 内容 |
|------|------|
| 所有 import 语句 | `useRef`, `useEffect`, `useCallback`, `useNavigate`, `useLocation`, `DocFrontmatter`, `TocHeading`, `katex/dist/katex.min.css`, mermaid 类型导入 |
| mermaid 懒加载基础设施 | `mermaidModule` 变量、`loadMermaid()` 函数签名和逻辑 |
| `processMermaidDiagrams()` | 整个函数不变 |
| `DocContentProps` 接口 | 所有 props 类型不变 |
| `headingLevelFromTag()` | 辅助函数不变 |
| `PROSE_CLASS` 常量 | 字符串值不变 |
| `initializeContent` 回调 | 逻辑不变（仅新增 SSR 守卫） |
| `prevHtmlRef` 跟踪逻辑 | 不变 |
| `mermaidInitializedRef` 逻辑 | 不变 |
| headings 提取和 `onHeadingsReady` 回调 | 不变 |
| IntersectionObserver 设置 | 不变 |
| 导航拦截 `useEffect` | 不变（仅新增 SSR 守卫） |
| 所有 cleanup 逻辑 | 不变 |

---

## 4 关键设计决策

### 4.1 为什么不在 SSR 时处理 Mermaid

1. **Mermaid 是纯客户端库：** Mermaid 依赖 DOM API（`querySelector`、`getAttribute`、`setAttribute`、`innerHTML` 操作、SVG 测量）和 `window` 对象，在 Node.js 中需要复杂的 polyfill 才能运行。
2. **Mermaid 对 SEO 无价值：** 图表渲染为 SVG，搜索引擎无法从中提取有意义的文本信息。
3. **构建性能：** 加载 mermaid（~500KB）并初始化会显著增加 SSG 构建时间。
4. **代码块已保留：** `<code class="language-mermaid">` 中的原始 Mermaid 文本在 HTML 中可见，用户禁用 JavaScript 或 JS 未加载时仍能看到图表源码。
5. **客户端接管：** 水合后 CSR 路径的 `useEffect` 会自动处理所有 Mermaid 图表。

### 4.2 为什么共享同一个 `contentRef`

- `contentRef` 在 SSR 路径绑定到包含 `dangerouslySetInnerHTML` 的 `<div>`。
- 水合后，React 将同一 DOM 节点与 CSR 路径（无 `dangerouslySetInnerHTML`）关联。
- React 水合算法会检测到 SSR HTML 中 `dangerouslySetInnerHTML` 的内容与客户端初始渲染的空的 `<div>` 之间的差异，**但** CSR 路径的 `useEffect` 会在水合后立即通过 `innerHTML` 重新写入内容，且 `prevHtmlRef` 比较会确保只在 `html` 变化时才写入。

**水合行为分析：**

1. SSR 输出：`<div ...>...[markdown-html]...</div>`（有内容）
2. React 客户端水合：期望 `<div ...></div>`（空内容）
3. React 会报告水合不匹配警告（hydration mismatch warning），但**不会崩溃**。
4. `useEffect` 紧接着执行，`prevHtmlRef.current !== html` → 写入 `innerHTML`，修正 DOM。

> **这是一个已知且可接受的权衡。** 水合警告在生产环境不会显示。如果未来需要消除此警告，可以在 CSR 路径的渲染中也使用 `dangerouslySetInnerHTML` 并配合 `suppressHydrationWarning`，但这会重新引入 Mermaid 覆盖问题——因为 React 会在任何重渲染时通过 `dangerouslySetInnerHTML` 覆盖 Mermaid SVG。当前的双路径方案是用一个 benign 的水合警告换取 Mermaid 图表的稳定性。

### 4.3 为什么不在同一组件中同时使用两种方法

React 不允许同一个元素同时使用 `dangerouslySetInnerHTML` 和 `children`。而且：
- 如果 CSR 路径也使用 `dangerouslySetInnerHTML`，任何 React 重渲染（如图片 onLoad 触发的状态更新）都会刷新 innerHTML，覆盖 Mermaid SVG。
- 这正是原始 bug 的根源，也是当初切换到 `useEffect` + 手动 `innerHTML` 的原因。

因此必须保持两个路径的分离：SSR 走 `dangerouslySetInnerHTML`，CSR 走 `useEffect` + `innerHTML`。

---

## 5 类型与接口

### 5.1 现有类型（不变）

所有类型来自 `src/types/doc.ts`，已存在且不需要修改：

```typescript
// src/types/doc.ts
export interface DocFrontmatter {
  title: string;
  description?: string;
  order?: number;
  sidebar?: boolean;
  toc?: boolean;
  [key: string]: unknown;
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}
```

### 5.2 Props 接口（不变）

```typescript
// 已在 DocContent.tsx 中定义
interface DocContentProps {
  html: string;
  frontmatter: DocFrontmatter;
  headings: TocHeading[];
  onHeadingsReady?: (headings: TocHeading[]) => void;
  onHeadingsVisible?: (headingId: string) => void;
}
```

### 5.3 调用方（不变）

`src/ssr/ssg-render.tsx` 中 `renderDocPageToString` 函数调用 `DocContent` 的方式不变：

```typescript
<DocContent
  html={entry.html}
  frontmatter={entry.frontmatter}
  headings={entry.headings}
/>
```

---

## 6 状态与副作用

### 6.1 SSR 路径副作用

| 副作用 | SSR 中是否执行 | 说明 |
|--------|:---:|------|
| `useEffect` (`initializeContent`) | ✗ | `renderToString` 不执行 effects |
| `useEffect` (导航拦截) | ✗ | 同上 |
| Mermaid 懒加载 | ✗ | 同上 |
| Headings 提取 | ✗ | 同上（但 `headings` 通过 props 从构建时预计算数据传入） |
| IntersectionObserver | ✗ | 无 DOM，无意义 |
| `window.__HYDRATION_DATA__` 消费 | ✗ | 在 `useDocData` hook 中，不在 `DocContent` 中 |

### 6.2 CSR 路径副作用（不变）

所有现有副作用保持不变。

---

## 7 构建流程影响

### 7.1 SSG 构建流程

```
vite build
  └── vite-plugin-easydoc.ts closeBundle
       └── renderDocPageToString()
            └── renderToString(...)
                 └── DocContent({ html: entry.html, ... })
                      └── typeof window === 'undefined' → true
                           └── 渲染 <div dangerouslySetInnerHTML={{ __html: entry.html }} />
                                └── 输出: 包含完整 Markdown HTML 的静态 HTML
```

### 7.2 预期 SSG 输出示例

修复前：
```html
<article class="w-full max-w-none">
  <div class="prose prose-neutral max-w-none dark:prose-invert ..."></div>
</article>
```

修复后：
```html
<article class="w-full max-w-none">
  <div class="prose prose-neutral max-w-none dark:prose-invert ...">
    <h2 id="introduction">Introduction</h2>
    <p>EasyCoda is a ...</p>
    <pre><code class="language-mermaid">
graph TD
  A --> B
    </code></pre>
    ...
  </div>
</article>
```

---

## 8 依赖关系

### 8.1 上游依赖

此修复**不依赖**任何其他任务。`DocContent.tsx` 是一个叶节点组件，只需修改自身。

### 8.2 下游影响

| 下游组件/文件 | 影响 | 需要修改 |
|---------------|------|:---:|
| `src/ssr/ssg-render.tsx` | SSG 输出现在包含文档内容 | ✗ |
| `src/pages/Doc.tsx` | 客户端行为不变 | ✗ |
| `src/plugins/vite-plugin-easydoc.ts` | 无影响（间接通过 `renderDocPageToString`） | ✗ |
| `src/hooks/useDocData.ts` | 无影响 | ✗ |

---

## 9 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|:---:|------|------|
| React 水合不匹配警告 | 高 | 开发环境控制台警告，生产环境不显示 | 可接受；未来可通过 `suppressHydrationWarning` 抑制 |
| `typeof window` 检测在 SSR 打包环境失效 | 低 | SSG 仍然输出空白 | Vite/Rollup 不替换 `typeof window`；已通过现有 SSR 基础设施验证此检测有效（`useIsMobile` hook 使用了相同模式） |
| Mermaid 代码块在 SSR HTML 中格式异常 | 低 | 客户端水合后 Mermaid 处理失败 | `<code class="language-mermaid">` 中的原始文本与 CSR 路径一致，客户端处理逻辑不变 |
| `dangerouslySetInnerHTML` 中的 HTML 包含不安全的脚本 | 极低 | XSS 风险 | HTML 由 `markdown-it` 在构建时生成，来源可信；内容作者为团队内部 |
| SSR 输出 HTML 体积增大 | 确定 | SSG 文件变大 | 这是预期行为——之前空白 `<div>` 是 bug，现在包含内容是修复 |

---

## 10 与现有规格的关系

- **`spec/components.md`** — `DocContent` 组件规格需更新：SSR 路径使用 `dangerouslySetInnerHTML`
- **`spec/ssr-architecture.md`** — 第 4.1 节中关于 `DocContent` 在 SSR 中的行为需补充说明
- **`spec/build-flow.md`** — 构建流程不变，但 SSR 输出质量提升
- **`spec/spa-hydration-fix.md`** — 无冲突；`DocContent` 不消费 `__HYDRATION_DATA__`