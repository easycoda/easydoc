# Conventions

## Naming Rules

| Category | Convention | Example |
|---|---|---|
| **Components** | PascalCase, `.tsx` | `DocSidebar.tsx`, `SearchDialog.tsx` |
| **Pages** | PascalCase, `.tsx`, in `src/pages/` | `Home.tsx`, `Doc.tsx`, `NotFound.tsx` |
| **Hooks** | camelCase, `use` prefix, `.ts` | `useDocData.ts`, `useTocHighlight.ts` |
| **Types** | PascalCase for types/interfaces, `.ts` | `DocFrontmatter`, `SearchIndexEntry` |
| **Stores** | camelCase, `Store` suffix, `.ts` | `appStore.ts` |
| **Services** | camelCase, `Service` suffix, `.ts` | `docService.ts` |
| **Utilities** | camelCase, `.ts` | `cn.ts`, `search.ts` |
| **Constants** | UPPER_SNAKE_CASE for primitives | `SUPPORTED_LOCALES` |

## File Organization

```
src/
  components/        # Shared UI components
    ui/              # shadcn/ui primitives (existing, do not modify)
  pages/             # Route-level page components
  hooks/             # Custom React hooks
  services/          # Data fetching / API layer
  store/             # Zustand stores
  types/             # TypeScript type definitions
  lib/               # Utility functions
  i18n/              # UI translation files
  plugins/           # Vite plugin source (build-time only, not bundled into client)
```

## Import Alias
- `@/` → `src/` (configured in `tsconfig.json` and `vite.config.ts`)

## Exports
- **Named exports** everywhere. No default exports except for page components (React Router lazy loading convention) and the `App` component.
- Types are exported with `export type` or `export interface`.

## Component Patterns
- All components are **functional components** using React 19 hooks.
- Props are typed with inline `interface` or imported type.
- No class components.
- No `React.FC` — use `function ComponentName(props: Props)` syntax.
- No inline styles — use Tailwind utility classes exclusively.

## Data Fetching
- All server state uses **TanStack Query** (`useQuery`, `useMutation`).
- All forms use **React Hook Form** + **Zod** validation.
- Global client state uses **Zustand**.
- Component-local state uses **useState** or **useReducer**.

## Styling
- **Tailwind CSS v4** utility classes only.
- Use `cn()` utility from `@/lib/utils` for conditional class merging.
- Use shadcn/ui component variants via their prop APIs.
- Dark mode: use Tailwind `dark:` variant (configured via `@custom-variant dark`).