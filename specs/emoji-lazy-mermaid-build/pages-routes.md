# Pages & Routes

No new pages or routes are introduced by these changes. Existing routes are unaffected.

| Route path | Component name | File path | Auth required? |
|---|---|---|---|
| `/` | `Home` | `src/pages/Home.tsx` | No |
| `/:lang` | `LangIndex` or `LangHome` | `src/pages/LangIndex.tsx` / `src/pages/LangHome.tsx` | No |
| `/:lang/*` | `Doc` | `src/pages/Doc.tsx` | No |
| `*` | `NotFound` | `src/pages/NotFound.tsx` | No |