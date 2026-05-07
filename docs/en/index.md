---
title: EasyDoc Documentation
description: EasyDoc is a self-contained Vite + React SSG documentation framework. Browse these docs to learn how it works and how to use it.
order: 0
---

# EasyDoc Documentation

Welcome to EasyDoc! This guide will help you understand the framework and get started using it for your own documentation sites.

## What is EasyDoc?

EasyDoc is a **self-contained Vite + React documentation framework** — the very project you are browsing right now. Its own documentation is compiled by its own SSG plugin, making it a living example of what it does.

Clone this repo to use as a starting point for your own documentation site, or copy the plugin into your existing Vite project. It is **not** an npm package you install — it's a complete project you clone, customize, and make your own.

At its core, EasyDoc compiles Markdown files into a multilingual, SEO-friendly static site with an app-like reading experience. Think of it as a lightweight alternative to VitePress or Docusaurus, built on top of Vite and React.

This project was fully written by React AI Agent Team on [EasyCoda](https://easycoda.com), I just made some css paddings.

## Quick Start

```bash
git clone https://github.com/easycoda/easydoc.git easydoc
cd easydoc
pnpm install
pnpm dev
```

Your docs live in the `docs/` directory. Open `http://localhost:8080` and start writing Markdown.

## Project Structure

```text
easydoc/
├── docs/
│   ├── en/
│   │   ├── index.md
│   │   ├── getting-started/
│   │   │   ├── getting-started.md
│   │   │   └── configuration.md
│   │   └── guides/
│   │       ├── theme.md
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
│   ├── types/
│   ├── services/
│   ├── ssr/    # server side rendering code when building
├── spec        # Project Design Spec written Architect Agent 
├── specs       # Project Design Spec written Architect Agent 
├── vite.config.ts
└── package.json
```

## Key Features

- **📝 Markdown First** — Write docs in standard Markdown with YAML frontmatter, compiled by markdown-it.
- **🌐 Multilingual** — Built-in i18n with locale-prefixed routes (`/en/`, `/zh/`), translations in `src/i18n/`.
- **⚡ SSG + SPA** — Build-time pre-rendering for SEO, runtime `hydrateRoot` for instant interactivity, CSR for subsequent navigation.
- **🔍 Full-Text Search** — fuse.js client-side search with index generated at build time. Press Cmd+K / Ctrl+K to open.
- **🎨 Syntax Highlighting** — Shiki with dual themes (vitesse-light / vitesse-dark), line highlighting, and diff view.
- **📊 Diagrams & Math** — Mermaid diagrams (lazy-loaded for performance) and KaTeX math via markdown-it-texmath.
- **🌗 Dark Mode** — System preference detection with manual toggle, SSR-safe via next-themes.
- **📱 Responsive** — shadcn sidebar, collapsible on mobile, with a header navigation menu.
- **🔎 SEO** — Per-page meta tags including title, description, og:* and canonical URL.

## Next Steps

- Head over to [Getting Started](/en/getting-started/getting-started) to understand how EasyDoc works.
- Read the [Configuration](/en/getting-started/configuration) guide for customization options.
- Learn about [Markdown Features](/en/guides/markdown-syntax) available in EasyDoc.
- Explore the [Search](/en/guides/search) functionality.