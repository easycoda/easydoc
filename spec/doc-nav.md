# Prev/Next Document Navigation Specification

## 1. Overview

为 EasyCoda 文档站点的每个文档页面底部增加「上一页」/「下一页」导航组件。导航顺序与侧边栏的深度优先扁平化遍历顺序完全一致。第一个文档无「上一页」，最后一个文档无「下一页」。该数据在 Vite SSG 构建阶段计算并注入到 `DocPageData` 和 `HydrationData` 中，确保预渲染 HTML 也包含导航信息（SEO 友好）。前端通过 React Router `<Link>` 实现客户端无刷新导航。

---

## 2. Pages & Routes

无新增路由页面。在现有 `DocPage` (`src/pages/Doc.tsx`) 页面底部增加导航区域。

| Route Path | Component Name | File Path | Auth Required |
|---|---|---|---|
| `/:lang/*` | `DocPage` | `src/pages/Doc.tsx` | No |

---

## 3. Component Map

### 3.1 DocPage（修改）

**树结构：**
```
DocPage
├── Skeleton (loading)
├── 404 content (error)
└── DocContent (success)
    └── DocNav  ← 新增，位于 DocContent 下方
```

#### DocPage — 修改
- **职责**：提取 `DocPageData` 中的 `prev` / `next` 字段，传递给 `DocNav` 渲染。
- **接收数据**：`DocPageData`（通过 `useDocData`），其中新增 `prev?` / `next?` 字段。
- **回调/事件**：无新增回调。
- **shadcn/ui 组件**：现有 `Skeleton`、`Button`，无新增。

### 3.2 DocNav（新增）

- **职责**：接收 `prev` 和 `next` 导航数据，渲染「← 上一页」和「下一页 →」两个链接（`<Link>`），如果某侧为 `null` 则隐藏该侧，两侧都为 `null` 时整体不渲染。
- **Props**：
  ```typescript
  interface DocNavProps {
    prev: { path: string; title: string } | null;
    next: { path: string; title: string } | null;
  }
  ```
- **回调/事件**：无回调（纯展示 + 导航）。
- **shadcn/ui 组件**：`Button`（`variant="ghost"` 或 `variant="outline"`），`Card`（可选，用于视觉包裹）。

---

## 4. Shared TypeScript Types

### 4.1 `src/types/doc.ts` — 新增类型

```typescript
/** 相邻文档的导航引用 */
export interface DocNavRef {
  path: string;   // 带语言前缀的完整路径，例如 "/en/guide/installation"
  title: string;  // 文档标题
}

/** A document that has been fully resolved (HTML + metadata) */
export interface DocPageData {
  html: string;
  frontmatter: DocFrontmatter;
  headings: TocHeading[];
  lang: string;
  /** Residual path after lang prefix, e.g. "guide/getting-started" */
  path: string;
  /** 上一篇文档。如果是第一篇则为 undefined */
  prev?: DocNavRef;
  /** 下一篇文档。如果是最后一篇则为 undefined */
  next?: DocNavRef;
}
```

### 4.2 `src/types/hydration.ts` — 新增字段

```typescript
export interface HydrationData {
  lang: string;
  path: string;
  frontmatter: {
    title: string;
    description?: string;
    order?: number;
  };
  html: string;
  headings: Array<{ id: string; text: string; level: number }>;
  /** 上一篇文档导航引用 */
  prev?: { path: string; title: string };
  /** 下一篇文档导航引用 */
  next?: { path: string; title: string };
}
```

---

## 5. State Architecture

无新增客户端状态。导航数据完全由构建阶段预计算并嵌入 `DocPageData` / `HydrationData` 中，`DocNav` 组件是纯展示组件，不管理任何内部状态。

---

## 6. API / Data Layer

### 6.1 数据来源

导航数据（`prev` / `next`）**不是**通过单独 API 获取的，而是在以下两个位置携带：

| 阶段 | 数据载体 | 说明 |
|---|---|---|
| **SSG（构建时）** | `HydrationData` (injected via `__HYDRATION_DATA__`) | 预渲染 HTML 携带 `prev`/`next` |
| **Dev / CSR** | `DocPageData` (JSON via `/api/doc/…` or virtual module) | 客户端导航时通过 TanStack Query 获取 |

### 6.2 构建期计算位置

在 `src/plugins/vite-plugin-easydoc.ts` 中：

1. **展平侧边栏**：基于 `buildManifest` 中构建的 `DocNavItem[]` 树，进行**深度优先遍历**，生成 `DocNavRef[]` 扁平数组。
2. **为每篇文档分配 prev/next**：遍历扁平数组，按索引 `i-1`（prev）和 `i+1`（next）赋值。
3. **注入到编译输出**：在 `load` 钩子（dev 模式）和 `applySsgTransform`（SSG 模式）中，将 `prev`/`next` 注入到 `DocPageData` 对象中。

### 6.3 TanStack Query 使用

无需新增 hook。`useDocData` (`src/hooks/useDocData.ts`) 已返回 `DocPageData`，新增的 `prev`/`next` 字段自动可用。

---

## 7. Conventions

与项目现有约定保持一致（见 `spec/conventions.md`）：

- **命名**：组件 `DocNav.tsx`（PascalCase）、类型 `DocNavRef`（PascalCase）。
- **导入别名**：`@/` → `src/`。
- **导出**：命名导出（`export function DocNav`）。
- **样式**：Tailwind CSS v4 工具类，使用 `cn()` 合并条件类名。
- **组件模式**：函数式组件 + 内联 `interface Props`。
- **导航**：使用 React Router v7 `<Link>` 组件。