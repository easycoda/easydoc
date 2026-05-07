# Header 导航菜单重构 — 嵌套结构 + NavigationMenu 组件

## 1 Overview

将当前 Header 中的扁平导航 (`<nav>` + `<Link>` 循环) 重构为支持嵌套层级的导航系统。父级菜单项可带有 `children`，桌面端使用 shadcn/ui `NavigationMenu` 组件（悬停展开子菜单），移动端 Sheet 中使用 `Collapsible` 实现可折叠展开/收起的菜单。首页和文档页共用同一套导航配置。目标：为用户提供结构清晰、可扩展的多层级文档导航体验。

---

## 2 Pages & Routes

Header 是所有页面的通用组件，无需新增路由。受影响的路由：

| Route path | Component name | File path | Auth required? |
|---|---|---|---|
| `/` | `HomePage` | `src/pages/Home.tsx` | No |
| `/:lang` | `LangIndexPage` | `src/pages/LangIndex.tsx` | No |
| `/:lang/*` | `DocPage` | `src/pages/Doc.tsx` | No |
| `*` | `NotFoundPage` | `src/pages/NotFound.tsx` | No |

所有页面均通过 `Layout` → `Header` 渲染同一套导航。

---

## 3 Component Map

### 3.1 Page: 所有页面（via `Layout` → `Header`）

**组件树：**
```
Layout
  └── Header (modified)
        ├── Desktop: NavigationMenu (new wrapper)
        │     ├── NavigationMenuList
        │     │     ├── NavigationMenuItem (for each NavLink)
        │     │     │     ├── [has children] → NavigationMenuTrigger + NavigationMenuContent
        │     │     │     │     └── NavigationMenuLink (per child)
        │     │     │     └── [no children, internal] → NavigationMenuLink (as <Link>)
        │     │     │     └── [no children, external] → NavigationMenuLink (as <a>)
        │     │     └── ...
        │     └── NavigationMenuViewport (rendered by NavigationMenu root)
        │
        ├── Mobile: Sheet (modified)
        │     └── MobileNavList (new leaf component)
        │           ├── [has children] → Collapsible (toggle expand/collapse)
        │           │     ├── CollapsibleTrigger (parent label)
        │           │     └── CollapsibleContent (child links)
        │           └── [no children, internal] → <Link>
        │           └── [no children, external] → <a>
        │
        └── ... (SearchTrigger, ThemeToggle, LanguageSwitcher — unchanged)
```

### 3.2 Leaf Components

#### `DesktopNavItem` — 桌面端单个导航项
- **职责：** 根据 `NavLink` 是否有 `children`，渲染为带下拉菜单的触发项或直接链接。
- **Props:**
  - `item: NavLink` — 来自 `siteConfig.nav` 的导航项
  - `currentPath: string` — 当前路由路径（用于高亮判断）
- **Callbacks emitted:** 无（纯展示 + 跳转）
- **shadcn/ui:** `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`

#### `MobileNavList` — 移动端嵌套导航列表
- **职责：** 在 Sheet 内渲染支持嵌套折叠的导航列表。父级用 `Collapsible` 包裹，子级平铺展示。
- **Props:**
  - `items: NavLink[]` — 导航项数组
  - `currentPath: string` — 当前路由路径
  - `onLinkClick: () => void` — 点击任意链接后关闭 Sheet
- **Callbacks emitted:** `onLinkClick`
- **shadcn/ui:** `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`, `Button`

#### `Header` — 顶部导航栏（修改现有组件）
- **职责：** 组合桌面端 `NavigationMenu` 和移动端 Sheet（内含 `MobileNavList`）。保持现有左右布局、搜索、主题切换、语言切换逻辑不变。
- **Props:** 不变（`showSidebarTrigger?: boolean`）
- **数据来源:** `siteConfig.nav`（类型变为 `NavLink[]` 含 `children`）
- **路由感知:** 通过 `useLocation()` 获取 `currentPath`，传递给子组件

---

## 4 Shared TypeScript Types

文件：`src/types/config.ts`（修改现有文件）

```typescript
import type { Locale } from './i18n';

/** Site-level configuration */
export interface SiteConfig {
  title: string;
  description: string;
  logo?: string;
  locales: Locale[];
  defaultLocale: Locale;
  /** Navigation links shown in the header. Supports nested children. */
  nav: NavLink[];
  /** Footer links */
  footer: FooterConfig;
  /** Social / external links */
  socialLinks?: SocialLink[];
}

/**
 * A navigation link entry.
 * - When `children` is present, this is a parent menu item (dropdown on desktop,
 *   collapsible on mobile). The `path` is optional in this case.
 * - When `children` is absent, this is a leaf link.
 * - `external`: if true, opens in new tab with rel="noopener noreferrer".
 * - `label`: i18n translation key for parent items (e.g. "nav.guide").
 *   For child items, `label` is the literal display text.
 */
export interface NavLink {
  label: string;
  path?: string;
  external?: boolean;
  children?: NavLink[];
}

export interface FooterConfig {
  copyright: string;
  links: FooterLink[];
}

export interface FooterLink {
  text: string;
  link: string;
}

export interface SocialLink {
  /** Lucide icon name */
  icon: string;
  link: string;
  label: string;
}
```

### 类型变更要点
- `NavLink.text` → `NavLink.label`（重命名，语义更清晰；表示 i18n key 或原文）
- `NavLink.link` → `NavLink.path`（重命名，与路由语义一致）
- 新增 `NavLink.children?: NavLink[]`（嵌套支持）
- `path` 改为可选（仅 leaf 节点必须有；有 children 的父级可无 path）

---

## 5 State Architecture

| State | Type | Default | Owner | Scope |
|---|---|---|---|---|
| `searchOpen` | `boolean` | `false` | `Header` (useState) | Header local |
| `mobileMenuOpen` | `boolean` | `false` | `Header` (useState) | Header local |
| `expandedItems` | `Set<string>` | `new Set()` | `MobileNavList` (useState) | MobileNavList local |
| `locale` | `Locale` | `'en'` | `useAppStore` (Zustand) | Global |

**`expandedItems` 说明：** `MobileNavList` 内部维护一个 `Set<string>`，记录哪些父级菜单项当前处于展开状态。key 使用 `NavLink.label`。

**Zustand store:** `src/store/appStore.ts` — 无需修改。

---

## 6 API / Data Layer

本次重构不涉及新增 API 调用。导航数据来源于静态配置 `siteConfig.nav`。

| Function name | Method + Endpoint | Request type | Response type | Query Hook | Calling component |
|---|---|---|---|---|---|
| N/A | N/A | N/A | N/A | N/A | N/A |

所有导航数据直接从 `@/lib/siteConfig` 导入的 `siteConfig.nav` 读取。

---

## 7 Conventions

沿用 `spec/conventions.md` 中已定义的全部规范。本轮新增/强调的点：

### 命名规则
- 新组件文件：`DesktopNavItem.tsx`、`MobileNavList.tsx`（放在 `src/components/` 下）
- 类型：`NavLink`（修改现有）
- 导出的组件函数：`DesktopNavItem`、`MobileNavList`

### 文件组织
```
src/
  components/
    Header.tsx           # 修改：引入 NavigationMenu + MobileNavList
    DesktopNavItem.tsx   # 新增：桌面端单个导航项渲染
    MobileNavList.tsx    # 新增：移动端嵌套导航列表
    ui/
      navigation-menu.tsx  # 不修改
      collapsible.tsx      # 不修改
      sheet.tsx            # 不修改
  types/
    config.ts            # 修改：NavLink 接口
  lib/
    siteConfig.ts        # 修改：nav 数据结构
  i18n/
    en.ts                # 修改：新增导航翻译 key
    zh.ts                # 修改：新增导航翻译 key
    index.ts             # 不修改
```

### 不变更
- `src/components/ui/navigation-menu.tsx` — 绝不动
- `src/store/appStore.ts` — 不动
- `src/router.tsx` — 不动
- `src/main.tsx` — 不动
- Vite 配置 — 不动
- 不引入任何第三方依赖