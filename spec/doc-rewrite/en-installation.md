# Spec: EN Installation — `docs/en/getting-started/installation.md`

## Current State (Problems)
- References `pnpm add easydoc` as npm package install (FICTIONAL)
- References `easydoc/plugin` import path (FICTIONAL)
- References `easydoc/client` TypeScript types (FICTIONAL)
- Lists fictional environment variables (`EASYDOC_DOCS_ROOT`, etc.)
- Shows fictional directory structure (symmetrical `en/guide/` and `zh/guide/`)
- Shows fictional frontmatter fields (no `sidebar` or `toc` in the reference, but they are real — keep those, but verify)

## Required Changes

### REMOVE
1. "Package Installation" section (`pnpm add easydoc`, `npm install easydoc`, `yarn add easydoc`)
2. "Peer Dependencies" section (not meaningful without the npm package)
3. "Environment Variables" section entirely (`EASYDOC_DOCS_ROOT`, `EASYDOC_LOCALES`, `EASYDOC_DEFAULT_LOCALE`)
4. "TypeScript Configuration" section referencing `easydoc/client` types
5. References to `easyDocPlugin` from `easydoc/plugin`

### REPLACE WITH: "Installation Methods"

**Method 1: Clone the Full Project**
```bash
git clone <repo-url> easydoc
cd easydoc
pnpm install
pnpm dev
```
Explain: This gives you the complete EasyDoc project including the SSG plugin, React components, i18n system, and these documentation pages. The project is self-documenting.

**Method 2: Copy Plugin into Existing Vite Project**
```bash
# In your existing Vite + React project:
pnpm add markdown-it markdown-it-anchor markdown-it-emoji markdown-it-texmath shiki katex gray-matter fuse.js @tanstack/react-query zustand react-router-dom

# Copy these files from the EasyDoc repo:
# src/plugins/vite-plugin-easydoc.ts
# src/ssg/ssg-render.tsx, src/ssg/ssg-layout.tsx
# src/ssg/css-loader.mjs, src/ssg/css-loader-hook.mjs
# src/types/vite-plugin.ts, doc.ts, config.ts, seo.ts, hydration.ts, i18n.ts
```

### REPLACE WITH: "Vite Plugin Configuration"
Show the real import path:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePluginEasyDoc } from './src/plugins/vite-plugin-easydoc';
import type { EasyDocPluginOptions } from './src/types/vite-plugin';

const easyDocOptions: EasyDocPluginOptions = {
  docsRoot: 'docs/',
  locales: ['en', 'zh'],
  defaultLocale: 'en',
};

export default defineConfig({
  plugins: [
    vitePluginEasyDoc(easyDocOptions),
    react(),
  ],
});
```

### REPLACE WITH: "Plugin Options Reference"
Show the real `EasyDocPluginOptions` interface:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `docsRoot` | `string` | Yes | — | Root directory containing language subdirectories |
| `locales` | `string[]` | Yes | — | Supported locale codes (e.g., `['en', 'zh']`) |
| `defaultLocale` | `string` | Yes | — | Default locale for root path redirect |
| `outDir` | `string` | No | Vite's `outDir` | Custom output directory |

### REPLACE WITH: "Dependencies"
List the real dependencies the plugin requires (they must be installed in the project):

| Package | Purpose |
|---------|---------|
| `markdown-it` | Markdown parsing engine |
| `markdown-it-anchor` | Heading anchor links (🔗) |
| `markdown-it-emoji` | Emoji shortcode support (:rocket:) |
| `markdown-it-texmath` | KaTeX math rendering |
| `shiki` | Syntax highlighting |
| `gray-matter` | Frontmatter parsing |
| `katex` | LaTeX math rendering |
| `fuse.js` | Full-text search |
| `react-router-dom` | SPA routing |
| `@tanstack/react-query` | Data fetching and caching |
| `zustand` | Client state management |

### REPLACE WITH: "Directory Structure"
Show the real, current directory structure:
```text
docs/
├── en/
│   ├── index.md
│   ├── getting-started/
│   │   ├── getting-started.md
│   │   ├── installation.md
│   │   └── configuration.md
│   └── guides/
│       ├── markdown-syntax.md
│       └── search.md
└── zh/
    ├── index.md
    ├── guide/
    │   ├── getting-started.md
    │   └── installation.md
    └── api/
        └── config.md
```

Note: You can organize files however you like within each language directory. The plugin scans recursively and builds the sidebar tree from the directory structure.

### KEEP (with verification)
- "Naming Conventions" section — accurate (kebab-case, index.md as landing page)
- "Verifying the Installation" section — update paths to match real structure
- "Troubleshooting" section — all three items are accurate

### REPLACE WITH: "Frontmatter Reference"
Show ONLY the actually supported fields (verify against `DocFrontmatter` type):

```yaml
---
# Required: The page title
title: My Page Title

# Optional: Short description for meta tags and search previews
description: A concise summary of the page content.

# Optional: Sort order in sidebar (lower numbers appear first)
order: 10

# Optional: Hide this page from the sidebar (default: true)
sidebar: false

# Optional: Show table of contents for this page (default: true)
toc: false
---
```

Remove the fictional `sidebar_label` and `tags` fields shown in examples.