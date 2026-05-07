# Spec: TOC Layout Fix for Large Screens (xl+)

## 1. Overview

The current layout on large screens (`xl+`) places the `TocSidebar` as a sibling of the entire body flex row, causing it to float to the far right edge of the viewport. The desired layout groups the doc content and TOC sidebar into a contiguous block — left: DocSidebar (16rem), center: doc content, right: TocSidebar (w-56, 14rem) with `gap-4` between the content and TOC. The doc-content + TOC block should be centered together rather than spread apart.

## 2. Pages & Routes

No route or page changes. This is purely a layout component restructure.

## 3. Component Map

The changes touch only two files:

### 3.1 `Layout.tsx` (modify)

**Current structure (body row):**
```
<div class="flex flex-1">
  <DocSidebar />         <!-- shrink-0 -->
  <SidebarInset>         <!-- flex-1, contains centered max-w-(--breakpoint-2xl) content -->
    <main><Outlet /></main>
  </SidebarInset>
  <TocSidebar />         <!-- w-56 shrink-0, xl:block, floats right -->
</div>
```

**Target structure (body row):**
```
<div class="flex flex-1">
  <DocSidebar />         <!-- shrink-0, unchanged -->
  <SidebarInset>
    <div class="flex w-full max-w-[calc(var(--breakpoint-2xl)+14rem+1rem)] flex-1 flex-col xl:flex-row ...">
      <main class="flex-1 ..."><Outlet /></main>
      <TocSidebar />     <!-- moved inside the inset wrapper, gap-4 between main and TOC -->
    </div>
  </SidebarInset>
</div>
```

**Key change:** Move `TocSidebar` inside the `SidebarInset`, placing it as a sibling of `<main>` in a flex-row on `xl+`. On smaller screens, the wrapper stays `flex-col` (TOC is already `hidden` below `xl`).

**Responsibilities:**
- Still renders `Header`, `Footer`, `DocSidebar`, `TocSidebar`, and `<Outlet />`
- The `TocSidebar` rendering moves from the body flex row into the `SidebarInset`'s inner wrapper
- The inner wrapper changes from a centered `max-w-(--breakpoint-2xl)` single-axis container to a flex container that accommodates content + TOC side-by-side on `xl+`

**Props/data received:** None changed — still reads React Router state, `useIsMobile`, TanStack Query for manifest, DocContext state.

**Callbacks/mutations emitted:** No changes.

**shadcn/ui primitives used:** `SidebarProvider`, `SidebarInset` — unchanged.

### 3.2 `TocSidebar.tsx` (modify)

**Current behavior:** Renders as a standalone `<aside>` with `w-56 shrink-0 hidden xl:block` and `sticky top-20`. It has its own independent positioning in the body flex row.

**Target behavior:** Same visual appearance, but it no longer needs to be an independent flex child that floats right. It will be placed inside the `SidebarInset` wrapper as a flex sibling of `<main>`. It should still use `w-56 shrink-0 hidden xl:block` and `sticky top-20`.

**Specific changes:**
- Remove standalone flex-shrink behavior assumptions (the parent will manage layout)
- Add a `className` prop to allow the parent layout to pass spacing or other layout classes if needed — OR keep the component self-contained and handle the gap in the parent
- Best approach: keep `TocSidebar` self-contained (no new props), handle `gap-4` spacing in the parent's flex container via Tailwind classes

**Responsibilities:** Unchanged — displays TOC headings, highlights active heading, handles smooth-scroll on click.

**Props/data received:** `headings: TocHeading[]`, `activeId: string`, `onHeadingClick: (id: string) => void` — unchanged.

**Callbacks/mutations emitted:** Unchanged.

**shadcn/ui primitives used:** `ScrollArea` — unchanged.

## 4. Shared TypeScript Types

No new types needed. Existing types in `src/types/doc.ts` remain sufficient:

- `TocHeading` — used by both `Layout.tsx` (via DocContext) and `TocSidebar.tsx`
- All other doc types unchanged

## 5. State Architecture

No changes. Existing state map:

| State | Type | Default | Owner | Scope |
|---|---|---|---|---|
| `headings` | `TocHeading[]` | `[]` | `Layout` (via `useState`) | DocContext |
| `activeHeadingId` | `string` | `""` | `Layout` (via `useState`) | DocContext |
| `manifest` | `DocManifest \| undefined` | `undefined` | TanStack Query | Layout component |
| sidebar open/state | managed by `SidebarProvider` | — | `SidebarProvider` | Global via context |

## 6. API / Data Layer

No changes. The single API call remains `fetchDocManifest` via `useQuery` in `Layout.tsx`.

## 7. Conventions

- All existing conventions unchanged
- Import alias: `@/` → `src/`
- Named exports everywhere
- Tailwind CSS v4 utility classes only

---

## 8. Layout Strategy — Detailed Breakdown

### Problem Analysis

The current body row is:
```
flex flex-1
├── DocSidebar (shrink-0)
├── SidebarInset (flex-1)
│   └── div.mx-auto.max-w-(--breakpoint-2xl)  ← centered, constrained
│       └── main (Outlet)
└── TocSidebar (w-56 shrink-0)  ← floats to far right edge
```

Because the flex row distributes space as: `[fixed] [flex-1] [fixed]`, the `SidebarInset` stretches to fill all remaining space and its inner content is centered via `mx-auto`. The TOC sits on the far right, separated from the doc content by however much whitespace the `SidebarInset` creates.

### Solution Strategy

Move `TocSidebar` inside `SidebarInset`, next to `<main>`, and adjust the wrapper to use `flex-row` on `xl+`:

```
flex flex-1
├── DocSidebar (shrink-0)
└── SidebarInset (flex-1)
    └── div.mx-auto.flex.flex-col.xl:flex-row.xl:gap-4.max-w-[...]
        ├── main.flex-1 (Outlet)
        └── TocSidebar (w-56 shrink-0)
```

On `xl+`:
- The wrapper becomes `flex-row` with `gap-4`
- `main` takes `flex-1` (fills available width)
- `TocSidebar` is `w-56 shrink-0` (fixed 14rem)
- The wrapper's `max-w` must accommodate both: `max-w-[calc(var(--breakpoint-2xl)+14rem+1rem)]` where `14rem` = TOC width (w-56) and `1rem` = gap-4

On `< xl`:
- `flex-col` (stacked vertically)
- TocSidebar is `hidden` (via its own `hidden xl:block` classes)

### Tailwind Classes to Change in Layout.tsx

**Current** (inside SidebarInset):
```
className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-1 flex-col"
```

**New** (inside SidebarInset):
```
className="mx-auto flex w-full xl:flex-row flex-col flex-1 max-w-(--breakpoint-2xl) xl:max-w-[calc(var(--breakpoint-2xl)+var(--toc-width)+var(--toc-gap))]"
```

Where CSS custom properties are set on the wrapper or use Tailwind arbitrary values:
- `--toc-width`: `14rem` (equals `w-56`)
- `--toc-gap`: `1rem` (equals `gap-4`)

Simpler approach without custom properties — use Tailwind arbitrary values directly:
```
className="mx-auto flex w-full flex-col flex-1 xl:flex-row xl:gap-4 max-w-(--breakpoint-2xl) xl:max-w-[calc(var(--breakpoint-2xl)+15rem)]"
```

(14rem + 1rem = 15rem combined)

**TocSidebar placement:** Move from the body flex row (after `</SidebarInset>`) to inside the wrapper div, after `<main>`. The `<main>` needs `flex-1` and a `min-w-0` to prevent overflow:
```
className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8"
```

### Tailwind Classes to Change in TocSidebar.tsx

No changes required. The `w-56 shrink-0 hidden xl:block` classes remain correct. The component is already self-contained and its `sticky top-20` positioning works correctly whether it's a direct child of a flex row or nested inside `SidebarInset`.

**One optional refinement:** The outer `<aside>` currently uses `pt-8` on its sticky container (`<nav className="sticky top-20 pt-8">`). The `pt-8` creates top padding. If the parent's `main` has `py-6`, the TOC may appear misaligned. Verify alignment but no change should be needed — the TOC's `pt-8` plus `top-20` sticky offset is intentional for TOC positioning independent of content padding.