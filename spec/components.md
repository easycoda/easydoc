# Component Map

## 1. App Shell

### `App`
- **File:** `src/App.tsx` (modify existing)
- **Responsibility:** Renders the router outlet inside `Layout`; provides global providers if any are added.
- **Props:** none (reads from React Router context)
- **Emits:** none
- **shadcn/ui:** none directly

### `Layout`
- **File:** `src/components/Layout.tsx`
- **Responsibility:** Renders the global shell: `Header` at top, `Sidebar` on the left, page content (via `<Outlet />`) in the center, optional `TocSidebar` on the right, and `Footer` at bottom. Manages responsive breakpoints for mobile sidebar drawer behavior.
- **Props:** none
- **Emits:** none
- **shadcn/ui:** `SidebarProvider`, `SidebarInset`

---

## 2. Header

### `Header`
- **File:** `src/components/Header.tsx`
- **Responsibility:** Top navigation bar containing Logo, primary nav links, search trigger button, theme toggle, and language switcher. On mobile, shows a hamburger menu.
- **Props received:** none (reads from global state)
- **Callbacks emitted:** none (uses global stores / navigation)
- **shadcn/ui:** `Button`, `Sheet` (for mobile menu), `SidebarTrigger`

### `SearchTrigger`
- **File:** `src/components/SearchTrigger.tsx`
- **Responsibility:** A button styled as a search bar that opens the `SearchDialog` when clicked or when Ctrl+K / Cmd+K is pressed.
- **Props:** none
- **Emits:** opens SearchDialog
- **shadcn/ui:** `Button`

### `SearchDialog`
- **File:** `src/components/SearchDialog.tsx`
- **Responsibility:** A command-palette-style search dialog. On mount, loads the search index (JSON) via TanStack Query. Accepts user input, runs fuse.js fuzzy search, displays results grouped by language. Selecting a result navigates to that page.
- **Props:** `open: boolean`, `onOpenChange: (open: boolean) => void`
- **Emits:** `onOpenChange`
- **shadcn/ui:** `Dialog`, `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`

### `ThemeToggle`
- **File:** `src/components/ThemeToggle.tsx`
- **Responsibility:** A button that cycles between `light`, `dark`, and `system` themes using the existing `useTheme` hook from `src/components/theme-provider.tsx`.
- **Props:** none
- **Emits:** none (calls `useTheme().setTheme`)
- **shadcn/ui:** `Button`, `DropdownMenu` (optional, for the three options)

### `LanguageSwitcher`
- **File:** `src/components/LanguageSwitcher.tsx`
- **Responsibility:** A dropdown that displays available languages. Selecting a language navigates to the equivalent page in that language (preserving the current doc path).
- **Props received:** none (reads current lang from `useParams`)
- **Emits:** none (uses `useNavigate`)
- **shadcn/ui:** `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `Button`

---

## 3. Sidebar

### `DocSidebar`
- **File:** `src/components/DocSidebar.tsx`
- **Responsibility:** Left sidebar displaying a collapsible tree of document navigation items for the current language, generated from `DocManifest`. Highlights the active page. Only renders on doc pages (not on the home page).
- **Props:** `manifest: DocManifest` (loaded by `Layout` or `DocPage`), `currentPath: string`
- **Emits:** navigation (via `useNavigate` or `<Link>`)
- **shadcn/ui:** `Sidebar`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `Collapsible`, `ScrollArea`

### `DocSidebarItem`
- **File:** `src/components/DocSidebarItem.tsx`
- **Responsibility:** Renders a single item in the sidebar tree. If it has children, renders a collapsible section. Highlights when `isActive` is true.
- **Props:** `item: DocNavItem`, `depth: number`, `activePath: string`
- **Emits:** none (uses `<Link>`)
- **shadcn/ui:** `SidebarMenuButton`, `SidebarMenuSubButton`, `Collapsible`

---

## 4. Table of Contents

### `TocSidebar`
- **File:** `src/components/TocSidebar.tsx`
- **Responsibility:** Right sidebar showing the page's heading outline (H2, H3). Highlights the currently visible heading as the user scrolls. Only renders on doc pages.
- **Props:** `headings: TocHeading[]`
- **Emits:** `onHeadingClick: (id: string) => void` (scrolls to heading)
- **shadcn/ui:** `ScrollArea`

---

## 5. Doc Content

### `DocPage`
- **File:** `src/pages/Doc.tsx`
- **Responsibility:** The main page component for all documentation routes. Extracts `lang` and `*` (splat) from `useParams()`. Fetches the compiled HTML and frontmatter for the current document via TanStack Query. Renders `DocContent` with the fetched data. Falls back to 404 if the document is not found.
- **Props:** none (reads from router params)
- **Emits:** none
- **shadcn/ui:** `Skeleton` (for loading state)

### `DocContent`
- **File:** `src/components/DocContent.tsx`
- **Responsibility:** Renders the compiled HTML content inside a `prose` container (Tailwind Typography). Sets up scroll-spy for TOC highlighting. Registers KaTeX and Mermaid initialization on mount.
- **Props:** `html: string`, `frontmatter: DocFrontmatter`, `headings: TocHeading[]`
- **Emits:** `onHeadingsReady: (headings: TocHeading[]) => void`
- **shadcn/ui:** none

---

## 6. Home Page

### `HomePage`
- **File:** `src/pages/Home.tsx`
- **Responsibility:** Landing page with a Hero section, feature cards, and CTA buttons linking to documentation.
- **Props:** none
- **Emits:** navigation
- **shadcn/ui:** `Button`, `Card`

### `HeroSection`
- **File:** `src/components/HeroSection.tsx`
- **Responsibility:** Large hero banner with project name, tagline, description, and primary/secondary CTA buttons.
- **Props:** none (content is hardcoded or from i18n)
- **Emits:** none (contains `<Link>` or uses `useNavigate`)
- **shadcn/ui:** `Button`

### `FeatureCards`
- **File:** `src/components/FeatureCards.tsx`
- **Responsibility:** Grid of feature cards showing key capabilities (Markdown, Multilingual, Search, Themes).
- **Props:** none
- **Emits:** none
- **shadcn/ui:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`

---

## 7. Footer

### `Footer`
- **File:** `src/components/Footer.tsx`
- **Responsibility:** Site footer with copyright and links.
- **Props:** none
- **Emits:** none
- **shadcn/ui:** none

---

## 8. Not Found

### `NotFoundPage`
- **File:** `src/pages/NotFound.tsx`
- **Responsibility:** 404 page with a helpful message and link back to home.
- **Props:** none
- **Emits:** navigation
- **shadcn/ui:** `Button`