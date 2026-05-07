# Documentation Rewrite — Cross-Cutting Spec

## Summary of All Changes

### Files to MODIFY (existing content replaced):
| # | File | Changes |
|---|------|---------|
| 1 | `docs/en/index.md` | Remove fictional API, replace with real clone/install flow, real project structure, real features |
| 2 | `docs/en/getting-started/getting-started.md` | Remove `pnpm create easydoc`, add git clone + copy-plugin methods |
| 3 | `docs/en/getting-started/installation.md` | Remove npm install, env vars, TS types; add real plugin config, dependencies, real frontmatter ref |
| 4 | `docs/en/getting-started/configuration.md` | Complete rewrite: real SiteConfig, real plugin options, real build output, real i18n config |
| 5 | `docs/en/guides/markdown-syntax.md` | Minimal: fix internal links, remove fictional frontmatter fields |
| 6 | `docs/en/guides/search.md` | Minimal: fix `documents/` → `docs/`, verify tips |
| 7 | `docs/zh/index.md` | Same changes as EN index, translated |
| 8 | `docs/zh/guide/getting-started.md` | Same changes as EN getting-started, translated |
| 9 | `docs/zh/guide/installation.md` | Same changes as EN installation, translated |
| 10 | `docs/zh/api/config.md` | Complete rewrite: real config, remove virtual modules, CSS vars, fictional APIs |
| 11 | `src/lib/siteConfig.ts` | Fix nav and footer paths to match actual file paths |

### Files to CREATE (new):
| # | File | Description |
|---|------|-------------|
| 12 | `docs/zh/guides/markdown-syntax.md` | Chinese translation of EN markdown features showcase |
| 13 | `docs/zh/guides/search.md` | Chinese translation of EN search guide |

## Fictional Content Checklist (MUST REMOVE from ALL files)
- [ ] `import { createEasyDoc } from 'easydoc'` — FICTIONAL
- [ ] `import { easyDocPlugin } from 'easydoc/plugin'` — FICTIONAL
- [ ] `import { easyDocPlugin } from 'easycoda-vite/plugin'` — FICTIONAL
- [ ] `import type { SiteConfig } from 'easydoc'` — FICTIONAL
- [ ] `import { createCompiler, createManifestBuilder } from 'easydoc'` — FICTIONAL
- [ ] `pnpm add easydoc` / `npm install easydoc` / `yarn add easydoc` — FICTIONAL
- [ ] `pnpm create easydoc my-docs` — FICTIONAL
- [ ] `"types": ["easydoc/client"]` in tsconfig — FICTIONAL
- [ ] `EASYDOC_DOCS_ROOT`, `EASYDOC_LOCALES`, `EASYDOC_DEFAULT_LOCALE` env vars — FICTIONAL
- [ ] `virtual:easydoc-doc:`, `virtual:easydoc-manifest:`, `virtual:easydoc-search-index` as user API — INTERNAL
- [ ] `--color-primary`, `--code-bg`, etc. CSS custom properties — NOT documentable public API
- [ ] `::: tip`, `::: warning`, `::: danger` containers — NOT IMPLEMENTED
- [ ] `src/config/sidebar.ts` manual sidebar — NOT IMPLEMENTED
- [ ] `src/config/site.ts` — wrong path; real is `src/lib/siteConfig.ts`
- [ ] `no-copy` code block feature — NOT IMPLEMENTED
- [ ] `{ #custom-id }` heading anchors — VERIFY before keeping
- [ ] `sidebar_label`, `tags` frontmatter — NOT SUPPORTED

## Structural Notes

### EN/ZH Directory Discrepancy
- EN: `getting-started/` and `guides/`
- ZH: `guide/` and `api/`

**Decision:** Keep both structures as-is. The plugin scans whatever directories exist. Document this flexibility. The `siteConfig.ts` nav paths must match the actual structure.

### New ZH Files Location
New `docs/zh/guides/markdown-syntax.md` and `docs/zh/guides/search.md` use `guides/` (matching EN) rather than `api/`. This means ZH will have both `guide/` and `guides/` directories — slightly confusing but functional.

**Alternative:** Place new ZH files under `docs/zh/api/` to match ZH's existing convention. But `markdown-syntax.md` is not API reference — it's a guide. Better to add `guides/` to ZH and document the structure.

**Decision:** Create `docs/zh/guides/` directory for the two new files.