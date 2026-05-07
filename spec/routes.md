# Pages & Routes

| Route Path | Component Name | File Path | Auth Required |
|---|---|---|---|
| `/` | `HomePage` | `src/pages/Home.tsx` | No |
| `/:lang` | `LangIndexPage` | `src/pages/LangIndex.tsx` | No |
| `/:lang/*` | `DocPage` | `src/pages/Doc.tsx` | No |
| `*` | `NotFoundPage` | `src/pages/NotFound.tsx` | No |

## Route Generation

Routes are configured programmatically in `src/router.tsx` using React Router v7 config-based routing (`createBrowserRouter`). The route tree is:

- `/` → `HomePage` (landing page with Hero, features, CTA)
- `/:lang` → `LangIndexPage` (language-level index / redirect to first doc)
- `/:lang/*` → `DocPage` (splat route for all doc pages, uses residual path to look up markdown)
- `*` → `NotFoundPage` (404 fallback)

All doc routes are rendered by the same `DocPage` component, which extracts `lang` and the residual path from `useParams()`, then fetches the corresponding compiled HTML chunk and frontmatter metadata.

Static HTML files are generated during `vite build` under `dist/[lang]/[path...]/index.html` to match these routes exactly, enabling direct URL access and SEO.