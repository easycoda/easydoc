# SSG 布局壳生成 — 技术规格

## 1. 概述

当前 SSG（静态站点生成）仅将编译后的 Markdown 文章 HTML 注入 `<div id="root"></div>`，缺少 Header、DocSidebar、TocSidebar、Footer 等布局组件。这导致静态 HTML 与 React hydration 后渲染的 DOM 结构不一致，引发视觉跳动（layout shift）。

本规格定义 `src/plugins/ssg-layout.ts` 文件中布局壳渲染函数的完整要求。这些函数在 SSG 构建阶段（`closeBundle`）生成与 React 渲染后完全一致的静态 HTML DOM 结构，从而消除 hydration mismatch。

## 2. 核心原则

1. **DOM 结构完全一致**：静态 HTML 的元素层级、标签类型、CSS class 必须与 React hydration 后的 DOM 树完全一致。
2. **不需要 JavaScript 交互**：静态版本只需要 HTML + Tailwind CSS class，不需要任何事件处理、React state、Radix UI 的交互逻辑。
3. **不需要复刻 Radix UI 的 ARIA 属性**：只保留静态 HTML 中可见的 DOM 结构（`data-slot`、`data-state` 等静态属性可保留以匹配 shadcn/ui 的样式选择器）。Radix 动态注入的 `data-state="closed"` / `data-state="open"` 等使用初始状态值。
4. **使用 i18n 翻译文本**：所有文本通过 `getTranslations(lang)` 获取翻译。
5. **语言**：所有代码注释和文档使用中文。

---

## 3. Pages & Routes（本规格涉及的页面类型）

| 路由 | 页面类型 | 包含布局组件 | Auth |
|------|---------|-------------|------|
| `/` (默认 locale) | home 页面 | Header + Footer + Home 内容 | No |
| `/:lang` | locale home 页面 | Header + Footer + Home 内容 | No |
| `/:lang/*` | doc 页面 | Header + DocSidebar + TocSidebar + Footer + 文章内容 | No |
| `/:lang` (index.md) | doc index 页面 | 同 doc 页面（`docPath = ''`） | No |

---

## 4. Component Map（React 组件 → 静态 HTML 映射）

### 4.1 整体布局骨架

React Layout 组件渲染的 DOM 结构（来自 `src/components/Layout.tsx`）：

```
SidebarProvider → <div data-slot="sidebar-wrapper" class="group/sidebar-wrapper flex min-h-svh w-full ...">
  DocContext.Provider →
    <div class="flex min-h-screen flex-col w-full">
      <Header showSidebarTrigger={onDocPage} />
      <div class="flex flex-1">
        <!-- DocSidebar（仅 doc 页面） -->
        <div class="shrink-0">
          <DocSidebar manifest={...} currentPath={...} />
        </div>
        <!-- 主内容区 -->
        <SidebarInset>
          <div class="mx-auto flex w-full flex-col flex-1 xl:flex-row xl:gap-4 max-w-(--breakpoint-2xl) xl:max-w-[calc(var(--breakpoint-2xl)+15rem)]">
            <main class="flex-1 min-w-0 p-4">
              <Outlet />  <!-- DocPage 或 HomePage -->
            </main>
            <!-- TocSidebar（仅 doc 页面） -->
            <TocSidebar headings={...} activeId={...} onHeadingClick={...} />
          </div>
        </SidebarInset>
      </div>
      <Footer />
    </div>
```

#### 4.1.1 静态化要点

- `SidebarProvider` 在静态 HTML 中简化为一个带 `data-slot="sidebar-wrapper"` 的 div wrapper，CSS 变量 `--sidebar-width: 16rem; --sidebar-width-icon: 3rem;` 通过 `style` 属性注入。
- Doc 页面的 Sidebar 默认为展开状态（`data-state="expanded"`），因为 `defaultOpen={true}`。
- `SidebarInset` 在 shadcn/ui 中渲染为带特定 class 的 `main` 标签。

### 4.2 Header 组件 (`src/components/Header.tsx`) → 静态 HTML

#### 4.2.1 React 组件渲染的 DOM 结构

```
<header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
  <div class="mx-auto flex h-14 items-center gap-4 px-4 sm:px-6">

    <!-- 左侧：Logo + SidebarTrigger -->
    <div class="flex shrink-0 items-center gap-2">
      <!-- 仅 doc 页面显示 -->
      [if showSidebarTrigger] <SidebarTrigger class="mr-1" />  → <button ...>
      <Link to="/" class="flex items-center gap-2 font-semibold text-lg">
        <LogoSvg />
        <span class="hidden sm:inline">{siteConfig.title}</span>
      </Link>
    </div>

    <!-- 中间：桌面端导航（非 mobile 时渲染）-->
    [if !isMobile]
    <div class="hidden flex-1 items-center justify-center sm:flex">
      <NavigationMenu>
        <NavigationMenuList>
          {siteConfig.nav.map(item => <DesktopNavItem key={item.label} item={item} />)}
        </NavigationMenuList>
      </NavigationMenu>
    </div>

    <!-- 右侧：操作按钮 -->
    <div class="flex flex-1 items-center justify-end gap-1 sm:flex-none">
      <SearchTrigger onOpen={...} />
      <ThemeToggle />
      <LanguageSwitcher />

      <!-- 仅 mobile 时显示的汉堡菜单 Sheet -->
      [if isMobile]
      <Sheet ...>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu class="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" class="w-64 p-0">
          <SheetHeader class="border-b px-4 py-3">
            <SheetTitle class="text-left">
              <Link to="/" class="flex items-center gap-2 font-semibold text-lg" onClick={...}>
                <LogoSvg />
                {siteConfig.title}
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div class="px-4 py-4">
            <MobileNavList items={siteConfig.nav} currentPath={pathname} onLinkClick={...} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </div>

  <SearchDialog open={searchOpen} onOpenChange={...} />
</header>
```

#### 4.2.2 Header 静态化策略

##### a) `showSidebarTrigger` 参数

- 对于 **doc 页面**（SSG）：`showSidebarTrigger=true`，需要渲染 `<button>` 形式的 SidebarTrigger
- 对于 **home 页面**（SSG）：`showSidebarTrigger=false`，不渲染

##### b) SidebarTrigger 静态化

```
<button data-sidebar="trigger" data-slot="sidebar-trigger" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none size-7 mr-1 hover:bg-accent hover:text-accent-foreground">
  <svg class="size-4" ...>  <!-- PanelLeftIcon SVG -->
  </svg>
  <span class="sr-only">切换侧边栏</span>
</button>
```

> **注意**：`variant="ghost"` 不产生额外的 HTML 元素或 class（shadcn/ui ghost variant 在静态 HTML 中只包含 hover 样式），但 `size="icon"` 会添加 `size-7` 类。

##### c) 桌面端导航菜单静态化

`NavigationMenu` 是 Radix UI 交互组件，静态化时需要还原其 DOM 结构但移除交互逻辑。

**整体结构**：

```
<div data-slot="navigation-menu" data-viewport="true" class="group/navigation-menu relative flex max-w-max flex-1 items-center justify-center">
  <ul data-slot="navigation-menu-list" class="group flex flex-1 list-none items-center justify-center gap-1">
    <!-- 每个 siteConfig.nav 项渲染一个 <li> -->
  </ul>
  <!-- viewport div（空占位）- Radix 动态添加，静态留空 -->
  <div class="absolute top-full left-0 isolate z-50 flex justify-center">
    <div data-slot="navigation-menu-viewport" class="origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow md:w-[var(--radix-navigation-menu-viewport-width)]"></div>
  </div>
</div>
```

**每个导航项的静态化规则**（`DesktopNavItem` + `MobileNavItem` 的合并静态版本）：

_有 children 的父节点（dropdown）_：

```
<li data-slot="navigation-menu-item" class="relative">
  <button data-slot="navigation-menu-trigger" class="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ... data-[state=open]:bg-accent/50 data-[state=open]:text-accent-foreground" data-state="closed">
    {翻译后的 label}
    <svg class="relative top-[1px] ml-1 size-3 transition duration-300" aria-hidden="true">  <!-- ChevronDown SVG -->
    </svg>
  </button>
  <div data-slot="navigation-menu-content" class="top-0 left-0 w-full p-2 pr-2.5 ... md:absolute md:w-auto group-data-[viewport=false]/navigation-menu:top-full ... group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow" data-state="closed">
    <ul class="grid w-56 gap-1 p-2">
      <!-- children 遍历 -->
    </ul>
  </div>
</li>
```

_无 children 的叶节点_：

- 外部链接（`external: true`）：`<a href="..." target="_blank" rel="noopener noreferrer">`
- 内部链接：`<a href="/{lang}{path}">`

```
<li data-slot="navigation-menu-item" class="relative">
  <a data-slot="navigation-menu-link" class="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ..."
     href="{path}" {...external attrs}>
    {翻译后的 label}
  </a>
</li>
```

> **翻译 key**：`siteConfig.nav[].label` 是 i18n key（如 `"nav.guide"`），需调用 `translations[key]` 获取翻译文本。child 的 `label` 是字面文本，不需要翻译。

##### d) 移动端 Sheet 静态化（仅 mobile 布局）

在 SSG 中，mobile 场景不重要（SSG 用于搜索引擎和初始加载），但仍需渲染以满足 DOM 一致性。移动端 Sheet 在静态 HTML 中应渲染为一个**隐藏的 div**（`hidden`）：

```
<div class="hidden">
  <!-- Sheet 的静态内容：简化版，不需要复刻完整 Sheet DOM -->
</div>
```

> **理由**：在桌面端（SSG 爬虫是桌面端），mobile Sheet 不会显示。React hydration 时 `useIsMobile()` 为 false，也不会渲染 Sheet。因此静态 HTML 使用 `hidden` 类隐藏即可避免 mismatch。

##### e) 桌面端导航项渲染参数

Header 静态 HTML 中的导航项需要知道当前语言 `lang`，以构建正确的 href：
- 内部链接：`href="/{lang}{path}"`（如果 path 已含 `/{lang}` 则直接使用）
- 外部链接：`href="{path}" target="_blank" rel="noopener noreferrer"`

##### f) SearchTrigger 静态化

```
<button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 md:w-full px-2 md:pr-12 relative text-muted-foreground" data-slot="button">
  <svg class="size-4 shrink-0 opacity-50">  <!-- SearchIcon SVG -->
  </svg>
  <span class="hidden md:inline-flex">{translations['search.placeholder']}</span>
  <kbd class="pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 select-none md:inline-flex ...">⌘K</kbd>
</button>
```

##### g) ThemeToggle 静态化

在静态 HTML 中，只渲染一个不带 dropdown 的按钮：

```
<button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none hover:bg-accent hover:text-accent-foreground size-9" aria-label="Toggle theme" data-slot="button">
  <svg class="size-[1.2rem] rotate-0 scale-100 transition-all">  <!-- Sun SVG（默认 light） -->
  </svg>
  <span class="sr-only">Toggle theme</span>
</button>
```

> **简化**：默认展示 Sun 图标（浅色模式），Dropdown 菜单在静态 HTML 中不渲染（它是通过 Radix Portal 渲染到 body 下的，不在 `<div id="root">` 内，不影响 hydration）。

##### h) LanguageSwitcher 静态化

```
<button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none hover:bg-accent hover:text-accent-foreground h-9 px-3" aria-label="Switch language" data-slot="button">
  <svg class="size-4" aria-hidden="true">  <!-- Globe SVG -->
  </svg>
  <span class="hidden sm:inline">{当前语言的显示名（如 "English" 或 "中文"）}</span>
</button>
```

> **简化**：Dropdown 菜单在静态 HTML 中不渲染（同 ThemeToggle）。

##### i) 页面标题部分

`siteConfig.title` 和 Logo 需要直接嵌入：

```
<a href="/{lang}" class="flex items-center gap-2 font-semibold text-lg">
  <!-- LogoSvg（内联 SVG） -->
  <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" ...>...</svg>
  <span class="hidden sm:inline">{siteConfig.title}</span>
</a>
```

> **注意**：在 home 页面，Logo link 指向 `/{lang}`；在 doc 页面，Logo link 指向 `/`。两者都正确（`/` + React Router 会自动重定向到默认 locale）。

---

### 4.3 移动端导航菜单（MobileNavList）静态化

移动端 Sheet 内的导航内容结构（来自 `src/components/MobileNavList.tsx`）：

```
<nav class="flex flex-col gap-1 py-2">
  <!-- 每个 siteConfig.nav 项 -->
  <!-- 有 children：collapsible 父项 -->
  <div data-state="closed">
    <button class="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ...">
      <span>{翻译后的 label}</span>
      <svg class="size-4 shrink-0 text-muted-foreground transition-transform duration-200">   <!-- ChevronRight SVG -->
      </svg>
    </button>
    <div class="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down" data-state="closed">
      <div class="ml-4 border-l border-border pl-2">
        <!-- children 作为叶节点链接 -->
      </div>
    </div>
  </div>
  <!-- 无 children：叶节点链接 -->
  <a href="{path}" class="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">{label}</a>
</nav>
```

> **注意**：SSG 中 mobile 导航区域整体被 `hidden` div 包裹，DEFAULT 状态是 `data-state="closed"`（折叠状态）。

---

### 4.4 DocSidebar 组件 (`src/components/DocSidebar.tsx`) → 静态 HTML

#### 4.4.1 React 组件渲染的 DOM 结构

`DocSidebar` 使用 shadcn/ui 的 `Sidebar`、`SidebarContent`、`SidebarGroup`、`SidebarMenu` 等组件。

shadcn/ui Sidebar 渲染结构（桌面端，`isMobile=false`，`state="expanded"`）：

```
<div class="group peer hidden text-sidebar-foreground md:block" data-state="expanded" data-collapsible="" data-variant="sidebar" data-side="left" data-slot="sidebar">
  <!-- sidebar-gap -->
  <div data-slot="sidebar-gap" class="relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0 ..."></div>
  <!-- sidebar-container -->
  <div data-slot="sidebar-container" class="fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r">
    <div data-sidebar="sidebar" data-slot="sidebar-inner" class="flex h-full w-full flex-col bg-sidebar">
      <!-- 这里是 SidebarHeader + SidebarContent -->
    </div>
  </div>
</div>
```

#### 4.4.2 DocSidebar 内容 DOM

```
<SidebarHeader class="pt-14">
  <!-- 空 -->
</SidebarHeader>
<SidebarContent>
  <ScrollArea>
    <SidebarGroup>
      <SidebarMenu>
        <!-- 遍历 manifest.nav -->
        {manifest.nav.map(item => <DocSidebarItem key={item.path} item={item} depth={0} activePath={currentPath} />)}
      </SidebarMenu>
    </SidebarGroup>
  </ScrollArea>
</SidebarContent>
```

**shadcn/ui 组件映射**：

- `SidebarHeader` → `<div data-sidebar="sidebar-header" data-slot="sidebar-header" class="flex flex-col gap-2 p-2 pt-14">`
- `SidebarContent` → `<div data-sidebar="sidebar-content" data-slot="sidebar-content" class="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">`
- `ScrollArea` → `<div data-slot="scroll-area" class="relative overflow-hidden"><div data-slot="scroll-area-viewport" class="size-full rounded-[inherit] overflow-auto" style=""><div data-slot="scroll-area-content" class="min-w-0">`...内容`</div></div></div>`
- `SidebarGroup` → `<div data-sidebar="sidebar-group" data-slot="sidebar-group" class="relative flex w-full min-w-0 flex-col p-2">`
- `SidebarMenu` → `<ul data-sidebar="sidebar-menu" data-slot="sidebar-menu" class="flex w-full min-w-0 flex-col gap-1">`

#### 4.4.3 DocSidebarItem 递归渲染 (`src/components/DocSidebarItem.tsx`)

**叶节点（无 children，depth=0）**：

```
<li data-sidebar="sidebar-menu-item" data-slot="sidebar-menu-item">
  <a data-sidebar="sidebar-menu-button" data-slot="sidebar-menu-button" data-active="true|false" class="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0" href="{item.path}">
    {item.title}
  </a>
</li>
```

> - `data-active="true"` 当 `item.path === currentPath`

**叶节点（无 children，depth>0）**：

```
<li data-sidebar="sidebar-menu-sub-item" data-slot="sidebar-menu-sub-item">
  <a data-sidebar="sidebar-menu-sub-button" data-slot="sidebar-menu-sub-button" data-active="true|false" class="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0" href="{item.path}">
    {item.title}
  </a>
</li>
```

**分支节点（有 children）**：

```
<li data-sidebar="sidebar-menu-item" data-slot="sidebar-menu-item">
  <button data-sidebar="sidebar-menu-button" data-slot="sidebar-menu-button" data-active="true|false" class="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0">
    <span class="flex-1 truncate text-left">{item.title}</span>
    <svg class="size-4 shrink-0 transition-transform duration-200 ...">  <!-- ChevronRight SVG -->
    </svg>
  </button>
  <!-- CollapsibleContent 展开的子菜单 -->
  <ul data-sidebar="sidebar-menu-sub" data-slot="sidebar-menu-sub" class="mx-3.5 min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden">
    <!-- 递归 children -->
  </ul>
</li>
```

> **SSG 中 Collapsible 的状态**：对于 `defaultOpen`（含活跃子项的分支），`data-state="open"`；其他分支 `data-state="closed"`。这需要在 SSG 时计算 `hasActiveDescendant`。

---

### 4.5 TocSidebar 组件 (`src/components/TocSidebar.tsx`) → 静态 HTML

#### 4.5.1 有 headings 时

```
<aside class="w-auto shrink-0 hidden xl:block">
  <nav class="sticky pt-8" aria-label="{title}">
    <div data-slot="scroll-area" class="relative overflow-hidden">
      <div data-slot="scroll-area-viewport" class="size-full rounded-[inherit] overflow-auto h-[calc(100vh-10rem)]" style="">
        <div data-slot="scroll-area-content" class="min-w-0">
          <ul class="space-y-1 border-l px-2">
            <p class="text-sm font-semibold text-foreground mb-3">{title}</p>
            <!-- headings.map -->
            <li>
              <a href="#{heading.id}" class="block text-sm py-1 transition-colors group {indentClass}">
                <span class="leading-snug {isActive? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground group-hover:border-border group-hover:text-foreground'}">
                  {heading.text}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</aside>
```

> - `indentClass`：`heading.level === 3` → `pl-6`，否则 `pl-2`
> - `title` 从 `TOC_TITLE[lang]` 获取（`en: "On this page"`, `zh: "本页目录"`）

#### 4.5.2 无 headings 时

```
<aside class="w-56 shrink-0 hidden xl:block">
  <div class="sticky top-20 pt-8">
    <p class="text-sm font-semibold text-foreground mb-3">{title}</p>
    <p class="text-xs text-muted-foreground">{lang === "zh" ? "暂无标题" : "No headings"}</p>
  </div>
</aside>
```

#### 4.5.3 SSG 中的 TocSidebar 策略

在 SSG 构建时，`headings` 数组来自 `SsgPageEntry.headings`。`activeId` 在静态 HTML 中始终为空字符串（不需要高亮任何项）。

---

### 4.6 Footer 组件 (`src/components/Footer.tsx`) → 静态 HTML

```
<footer role="contentinfo" class="border-t border-border mt-auto py-8 px-4 sm:px-6 lg:px-8">
  <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
    <p class="text-sm text-muted-foreground">{siteConfig.footer.copyright}</p>
    <!-- 有 links 时 -->
    [if siteConfig.footer.links.length > 0]
    <nav aria-label="Footer navigation">
      <ul class="flex flex-wrap items-center gap-x-6 gap-y-2">
        <!-- 遍历 links -->
        <!-- 外部链接 -->
        <li>
          <a href="{link}" target="_blank" rel="noopener noreferrer" class="text-sm text-muted-foreground transition-colors hover:text-foreground">{text}</a>
        </li>
        <!-- 内部链接 -->
        <li>
          <a href="{link}" class="text-sm text-muted-foreground transition-colors hover:text-foreground">{text}</a>
        </li>
      </ul>
    </nav>
  </div>
</footer>
```

> Footer 组件不含任何交互逻辑，直接复制 DOM 结构即可。

---

### 4.7 文章内容区

文章内容区域在 `Layout.tsx` 中渲染如下：

```
<SidebarInset>
  <div class="mx-auto flex w-full flex-col flex-1 xl:flex-row xl:gap-4 max-w-(--breakpoint-2xl) xl:max-w-[calc(var(--breakpoint-2xl)+15rem)]">
    <main class="flex-1 min-w-0 p-4">
      {文章 HTML}
    </main>
    {TocSidebar}
  </div>
</SidebarInset>
```

`SidebarInset` 对应 shadcn/ui 渲染的：

```
<main data-slot="sidebar-inset" class="relative flex min-h-svh flex-1 flex-col bg-background peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm">
  ...内容...
</main>
```

---

## 5. Shared TypeScript Types

以下类型定义位于 `src/types/` 中，且被 `ssg-layout.ts` 导入使用：

### 5.1 `src/types/doc.ts`（已存在，引用）

```typescript
export interface DocManifest { lang: string; nav: DocNavItem[]; }
export interface DocNavItem { title: string; path: string; children?: DocNavItem[]; order?: number; isGroup?: boolean; }
export interface TocHeading { id: string; text: string; level: number; }
```

### 5.2 `src/types/config.ts`（已存在，引用）

```typescript
export interface SiteConfig { title: string; description: string; locales: Locale[]; defaultLocale: Locale; nav: NavLink[]; footer: FooterConfig; ... }
export interface NavLink { label: string; path?: string; external?: boolean; children?: NavLink[]; }
export interface FooterConfig { copyright: string; links: FooterLink[]; }
export interface FooterLink { text: string; link: string; }
```

### 5.3 `SsgPageEntry`（来自 `vite-plugin-easydoc.ts` 内部类型）

```typescript
interface SsgPageEntry {
  html: string;
  frontmatter: DocFrontmatter;
  headings: TocHeading[];
  lang: string;
  docPath: string;
  modulePath: string;
}
```

---

## 6. 函数签名与数据流

### 6.1 `src/plugins/ssg-layout.ts` 导出函数

```typescript
import type { DocManifest, TocHeading } from '../types/doc';
import type { SiteConfig } from '../types/config';

/**
 * 为 doc 页面生成包含完整布局壳的静态 HTML。
 *
 * @param entry - SSG 页面条目（编译后的文章 HTML + 元数据）
 * @param manifest - 当前语言的文档清单（包含 nav 导航树）
 * @param translations - 当前语言的 UI 翻译扁平对象
 * @param siteConfig - 站点配置
 * @param currentPath - 当前页面的完整路径（如 "/en/guide/getting-started"），
 *                      用于在 DocSidebar 中标记激活项
 * @returns 完整的静态 HTML 字符串（可直接放入 <div id="root">...</div>）
 */
export function renderDocLayout(
  entry: SsgPageEntry,
  manifest: DocManifest,
  translations: Record<string, string>,
  siteConfig: SiteConfig,
  currentPath: string,
): string;

/**
 * 为 home 页面生成包含 Header + Footer 布局壳的静态 HTML。
 *
 * @param homeHtml - 已生成的首页内容 HTML（来自 generateHomePageHtml）
 * @param translations - 当前语言的 UI 翻译扁平对象
 * @param siteConfig - 站点配置
 * @param lang - 当前语言
 * @returns 完整的静态 HTML 字符串
 */
export function renderHomeLayout(
  homeHtml: string,
  translations: Record<string, string>,
  siteConfig: SiteConfig,
  lang: string,
): string;
```

### 6.2 内部辅助函数（不导出）

```typescript
/** 递归判断 DocNavItem 树中是否存在与 activePath 匹配的项 */
function hasActiveDescendant(item: DocNavItem, activePath: string): boolean;

/** 递归渲染 DocSidebar 导航项为静态 HTML 字符串 */
function renderDocSidebarItems(
  items: DocNavItem[],
  depth: number,
  activePath: string,
): string;

/** 渲染单个 layout 区域块（内部组合各种子渲染函数） */
function renderHeader(
  translations: Record<string, string>,
  siteConfig: SiteConfig,
  lang: string,
  showSidebarTrigger: boolean,
): string;

function renderFooter(siteConfig: SiteConfig): string;

function renderTocSidebar(
  headings: TocHeading[],
  translations: Record<string, string>,
  lang: string,
): string;
```

### 6.3 数据流

```
vite-plugin-easydoc.ts closeBundle()
  │
  ├─ Doc 页面 SSG：
  │   1. collectAllSsgEntries()                   → SsgPageEntry[]
  │   2. buildManifest(lang)                      → DocManifest
  │   3. getTranslations(lang)                    → Record<string, string>
  │   4. renderDocLayout(entry, manifest, t, cfg, currentPath) → HTML 字符串
  │   5. 将 HTML 注入模板的 <div id="root"> 中
  │
  └─ Home 页面 SSG：
      1. generateHomePageHtml(lang, t, cfg)       → home 内容 HTML
      2. renderHomeLayout(homeHtml, t, cfg, lang)  → 完整 HTML 字符串
      3. 将 HTML 注入模板的 <div id="root"> 中
```

---

## 7. 与 `src/plugins/vite-plugin-easydoc.ts` 的集成点

### 7.1 导入变更

在 `vite-plugin-easydoc.ts` 顶部添加导入：

```typescript
import { renderDocLayout, renderHomeLayout } from './ssg-layout';
```

### 7.2 `applySsgTransform` 函数修改

当前 `applySsgTransform` 的逻辑：

```typescript
// 旧：只注入文章 HTML
result = result.replace(
  /<div\s+id="root"\s*>\s*<\/div>/,
  `<div id="root">${entry.html}</div>`,
);
```

**修改后**：

```typescript
// 新：注入完整布局壳 + 文章 HTML
const manifest = buildManifest(entry.lang); // 或在循环外预计算
const translations = getTranslations(entry.lang);
const currentPath = `/${entry.lang}${entry.docPath ? `/${entry.docPath}` : ''}`;
const fullLayoutHtml = renderDocLayout(entry, manifest, translations, siteConfig, currentPath);

result = result.replace(
  /<div\s+id="root"\s*>\s*<\/div>/,
  `<div id="root">${fullLayoutHtml}</div>`,
);
```

### 7.3 Home 页面 SSG 修改

当前 home 页面 SSG 注入 `homeHtml` 到 `<div id="root">`：

```typescript
// 旧
homePageHtml = homePageHtml.replace(
  /<div\s+id="root"\s*>\s*<\/div>/,
  `<div id="root">${homeHtml}</div>`,
);
```

**修改后**：

```typescript
// 新
const fullHomeHtml = renderHomeLayout(homeHtml, translations, siteConfig, lang);
homePageHtml = homePageHtml.replace(
  /<div\s+id="root"\s*>\s*<\/div>/,
  `<div id="root">${fullHomeHtml}</div>`,
);
```

### 7.4 性能注意事项

- `buildManifest(lang)` 在 doc 页面 SSG 循环中可能被多次调用。应在 `closeBundle` 顶部预计算所有语言的 manifest，存入 `Map<string, DocManifest>`。
- `getTranslations(lang)` 也是纯计算，可以在循环外预取。

---

## 8. 需要内联的 SVG 图标清单

以下 Lucide 图标需要以内联 SVG 形式嵌入静态 HTML：

| 图标名 | 用途 | SVG 尺寸 | 父元素 class |
|--------|------|----------|-------------|
| Logo (book) | Header logo | `class="size-6"` | `<a>` 内 |
| PanelLeft | SidebarTrigger | `class="size-4"` | `<button>` 内 |
| Search | SearchTrigger | `class="size-4 shrink-0 opacity-50"` | `<button>` 内 |
| Sun | ThemeToggle (默认) | `class="size-[1.2rem] rotate-0 scale-100 transition-all"` | `<button>` 内 |
| Globe | LanguageSwitcher | `class="size-4" aria-hidden="true"` | `<button>` 内 |
| ChevronDown | NavigationMenuTrigger | `class="relative top-[1px] ml-1 size-3 transition duration-300" aria-hidden="true"` | `<button>` 内 |
| ChevronRight | Sidebar 折叠箭头 | `class="size-4 shrink-0 transition-transform duration-200"` | `<button>` 内 |
| Menu (hamburger) | Mobile menu trigger | `class="size-5"` | `<button>` 内（hidden） |

> 所有 SVG 参考 `src/plugins/ssg-home.ts` 中的 SVG 内联模式：每个 SVG 定义为一个 `const` 字符串常量。

---

## 9. 约定

1. **文件位置**：`src/plugins/ssg-layout.ts`
2. **导入别名**：`@/` → `src/`，但 plugin 文件中使用相对路径导入（因不在 Vite 的 resolve alias 覆盖范围内）
3. **导出方式**：命名导出（`export function`）
4. **字符串拼接**：使用模板字符串（`\`...\``）拼接 HTML，性能不用考虑
5. **HTML 转义**：所有用户生成的文本（标题、描述等）通过 `escapeHtml()` 转义。复用 `src/plugins/ssg-home.ts` 中的 `escapeHtml` 函数（或在该文件中重新定义）
6. **代码注释**：使用中文注释
7. **缩进**：生成的 HTML 不要求美观缩进，但 DOM 树结构必须正确