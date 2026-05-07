# Spec: EN Getting Started — `docs/en/getting-started/getting-started.md`

## Current State (Problems)
- References `pnpm create easydoc` scaffolding tool (FICTIONAL)
- Describes a scaffolded project structure that doesn't match reality
- Links to fictional `/en/guide/installation` and `/en/api/config` paths

## Required Changes

### REMOVE
1. The entire "Scaffold a New Project" section (with `pnpm create easydoc my-docs`)
2. The fictional project structure that follows it
3. References to "create-easydoc" scaffolding tool

### REPLACE WITH: "Clone the Project"
Replace the scaffolding section with:

```bash
git clone <repo-url> easydoc
cd easydoc
pnpm install
```

Explain: This clones the entire EasyDoc project, which is self-documenting — the docs you're reading are compiled by the project itself.

### REPLACE WITH: "Alternative: Copy the Plugin"
Add a second approach for users who already have a Vite project:

1. Copy `src/plugins/vite-plugin-easydoc.ts` and `src/ssg/` to your project
2. Copy `src/types/vite-plugin.ts`, `src/types/doc.ts`, `src/types/config.ts`, `src/types/seo.ts`, `src/types/hydration.ts`, `src/types/i18n.ts` to your project
3. Install required dependencies (see Installation page)
4. Create `docs/<lang>/` directories with your Markdown files
5. Import and configure the plugin in your `vite.config.ts`

### KEEP (verbatim or with minor edits)
- Prerequisites section (Node.js 18+, pnpm 8+, code editor)
- "Start the Dev Server" section (`pnpm dev`, browser at localhost:8080)
- "Write Your First Document" section (frontmatter + markdown example)
- "Add a New Page" section
- "Add Code Examples" section
- "Build for Production" section (`pnpm build` → `dist/`)

### MODIFY: Next Steps Links
Update to:
- Installation → `/en/getting-started/installation`
- Configuration → `/en/getting-started/configuration`
- Markdown Features → `/en/guides/markdown-syntax`

### MODIFY: "Start the Dev Server"
Add note: "The dev server supports Hot Module Replacement (HMR) for Markdown files — changes to `.md` files are reflected instantly. It also serves API endpoints at `/api/doc/:lang/*` for fetching document data during development."

### MODIFY: "Build for Production"
Add note: "The build output in `dist/` contains fully pre-rendered HTML pages for every document. Each page has server-side rendered content in `<div id=\"root\">` that React hydrates on load. This makes the site SEO-friendly and fast on first paint."