# Spec: EN Home Page — `docs/en/index.md`

## Current State (Problems)
The current file:
- Describes EasyDoc as an npm-installable package
- Shows fictional `createEasyDoc` API in the quick example
- Shows fictional project structure (symmetrical en/zh with identical subdirs)
- Links to non-existent `/en/guide/getting-started` path
- Links to `/en/guide/installation` (wrong path compared to `getting-started/installation.md`)
- Links to `/en/api/config` (doesn't exist in EN docs)

## Required Changes

### REMOVE
1. The entire "Quick Example" code block with `createEasyDoc` from `'easydoc'`
2. The fictional project structure under "Project Structure"
3. All references to EasyDoc as a downloadable package

### REPLACE WITH: "What is EasyDoc?"
Keep the general description but make it clear this is a **self-contained project**, not a package. Rewrite to:
- "EasyDoc is a self-contained Vite + React documentation framework. It is the project you are currently browsing — its own documentation is compiled by its own build plugin."
- Position it as: "Clone this repo to use as a starting point for your own documentation site, or copy the plugin into your existing Vite project."
- Emphasize: self-documenting, SSG + SPA, markdown-first

### REPLACE WITH: "Quick Start"
Replace the `createEasyDoc` code block with:
```bash
git clone <repo-url> my-docs
cd my-docs
pnpm install
pnpm dev
```

### REPLACE WITH: "Real Project Structure"
Show the real directory structure:
```text
easydoc/
├── docs/
│   ├── en/
│   │   ├── index.md
│   │   ├── getting-started/
│   │   │   ├── getting-started.md
│   │   │   ├── installation.md
│   │   │   └── configuration.md
│   │   └── guides/
│   │       ├── markdown-syntax.md
│   │       └── search.md
│   └── zh/
│       ├── index.md
│       ├── guide/
│       │   ├── getting-started.md
│       │   └── installation.md
│       └── api/
│           └── config.md
├── src/
│   ├── plugins/
│   │   └── vite-plugin-easydoc.ts   # The SSG plugin
│   ├── components/
│   ├── pages/
│   ├── i18n/
│   └── types/
├── vite.config.ts
└── package.json
```

### REPLACE WITH: "Key Features" Section
Keep the existing feature bullets but ensure accuracy:
- **📝 Markdown First** — Standard Markdown with YAML frontmatter, compiled by markdown-it
- **🌐 Multilingual** — Built-in i18n with locale-prefixed routes (`/en/`, `/zh/`), translations in `src/i18n/`
- **⚡ SSG + SPA** — Build-time pre-rendering for SEO, runtime `hydrateRoot` for instant interactivity, CSR for subsequent navigation
- **🔍 Full-Text Search** — fuse.js client-side search, index generated at build time, Cmd+K / Ctrl+K to open
- **🎨 Syntax Highlighting** — Shiki with dual themes (vitesse-light / vitesse-dark), line highlighting, diff view
- **📊 Diagrams & Math** — Mermaid diagrams (lazy-loaded), KaTeX math via markdown-it-texmath
- **🌗 Dark Mode** — System preference detection + manual toggle, SSR-safe via next-themes
- **📱 Responsive** — shadcn sidebar, collapsible on mobile, header navigation menu
- **🔎 SEO** — Per-page meta tags (title, description, og:*, canonical)

### REPLACE WITH: "Next Steps"
Update links to match actual file structure:
- Getting Started → `/en/getting-started/getting-started`
- Installation → `/en/getting-started/installation`
- Configuration → `/en/getting-started/configuration`
- Markdown Features → `/en/guides/markdown-syntax`
- Search → `/en/guides/search`

### MODIFY: Frontmatter
Update `description` to reflect the real project (remove "npm package" language):
```yaml
description: "EasyDoc is a self-contained Vite + React SSG documentation framework. Browse these docs to learn how it works and how to use it."
```