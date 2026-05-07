# State Architecture

| State | Type | Default | Owner | Scope |
|---|---|---|---|---|
| `locale` | `Locale` (`'en' \| 'zh'`) | `'en'` | `useAppStore` (Zustand) | Global |
| Theme | `'dark' \| 'light' \| 'system'` | `'system'` | `ThemeProvider` (React Context) | Global |
| Search dialog open | `boolean` | `false` | `SearchDialog` (useState) | Local |
| Mobile sidebar open | `boolean` | `false` | `SidebarProvider` (shadcn/ui) | Layout |
| Doc page data | `DocPageData \| undefined` | `undefined` | TanStack Query cache | Global (cached) |
| Search index | `SearchIndex` | `[]` | TanStack Query cache | Global (cached) |
| Doc manifest per lang | `DocManifest \| undefined` | `undefined` | TanStack Query cache | Global (cached) |

---

## Zustand Store: `src/store/appStore.ts`

```typescript
// Exported actions:
export const useAppStore: () => AppState;
```

The store holds `locale` and `setLocale`. On `setLocale`, the store persists the selection to `localStorage` under key `"easydoc-locale"` and re-initializes from `localStorage` on creation.

---

## TanStack Query Keys

| Query Key | Data |
|---|---|
| `['doc', lang, path]` | `DocPageData` |
| `['manifest', lang]` | `DocManifest` |
| `['search-index']` | `SearchIndex` |

---

## Local State (useState / useReducer)

| Component | State | Purpose |
|---|---|---|
| `SearchDialog` | `open: boolean` | Dialog visibility |
| `SearchDialog` | `query: string` | Search input value |
| `SearchDialog` | `results: SearchIndexEntry[]` | Filtered results (derived via fuse.js) |
| `DocContent` | `activeHeadingId: string` | Currently visible heading for TOC highlight |
| `LanguageSwitcher` | `open: boolean` | Dropdown open state |
| `DocSidebar` | `expandedGroups: Set<string>` | Which sidebar groups are expanded |