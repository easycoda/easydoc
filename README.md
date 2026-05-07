# 📘 EasyDoc — Beautiful Documentation Made Simple

> A fast, modern documentation engine powered by Vite. Write in Markdown, ship beautiful SEO-friendly docs — all generated at build time.

## What is EasyDoc?

EasyDoc is a self-contained Vite + React documentation framework — the very project you are browsing right now. Its own documentation is compiled by its own SSG plugin, making it a living example of what it does.

Clone this repo to use as a starting point for your own documentation site, or copy the plugin into your existing Vite project. It is not an npm package you install — it’s a complete project you clone, customize, and make your own.

At its core, EasyDoc compiles Markdown files into a multilingual, SEO-friendly static site with an app-like reading experience. Think of it as a lightweight alternative to VitePress or Docusaurus, built on top of Vite and React.

| Light | Dark | 
|--------|----------|
| ![Default Light Home](/default-light.jpg) ![Default Light Doc](/default-light-doc.jpg) | ![Default Dark Home](/default-dark.jpg) ![Default Dark Doc](/default-dark-doc.jpg) |

---

## ✨ Features

- **📝 Markdown First** — Write docs in standard Markdown with YAML frontmatter, compiled by markdown-it.
- **🌐 Multilingual** — Built-in i18n with locale-prefixed routes (`/en/`, `/zh/`), translations in `src/i18n/`.
- **⚡ SSG + SPA** — Build-time pre-rendering for SEO, runtime `hydrateRoot` for instant interactivity, CSR for subsequent navigation.
- **🔍 Full-Text Search** — fuse.js client-side search with index generated at build time. Press Cmd+K / Ctrl+K to open.
- **🎨 Syntax Highlighting** — Shiki with dual themes (vitesse-light / vitesse-dark), line highlighting, and diff view.
- **📊 Diagrams & Math** — Mermaid diagrams (lazy-loaded for performance) and KaTeX math via markdown-it-texmath.
- **🌗 Dark Mode** — System preference detection with manual toggle, SSR-safe via next-themes.
- **📱 Responsive** — shadcn sidebar, collapsible on mobile, with a header navigation menu.
- **🔎 SEO** — Per-page meta tags including title, description, og:* and canonical URL.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI component library |
| **TypeScript** | Type-safe development (strict mode) |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **shadcn/ui** | Accessible, customizable UI primitives |
| **Vite 7** | Build tool and dev server |
| **lucide-react** | Beautiful, consistent icon library |
| **react-router-dom v7** | Client-side routing |
| **fuse.js** | Fuzzy search engine |
| **KaTeX** | Mathematical notation rendering |
| **Mermaid** | Diagram and chart rendering |

---

## 📁 Project Structure

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

---

## 🚀 Quick Start

Get EasyDoc running locally in under a minute:

```bash
# 1. Clone the repository
git clone https://github.com/easycoda/easydoc.git
cd easydoc

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm run dev

# 4. Open your browser
# Visit http://localhost:8080
```

The dev server supports hot module replacement — your documentation updates appear instantly.

---

## ✍️ Writing Documentation

EasyDoc uses standard Markdown with YAML frontmatter. Simply add `.md` files to the `docs/` directory:

```markdown
---
title: Getting Started
description: Learn how to install and configure EasyDoc.
order: 1
---

# Getting Started

## Installation

EasyDoc is incredibly simple to set up...
```

### Key Conventions

- **Frontmatter** (required): `title`, `description`, and `order` between `---` delimiters
- **File naming**: Use kebab-case (e.g., `getting-started.md`)
- **Directory structure**: Files under `docs/{lang}/` mirror the URL path
- **Heading anchors**: Every heading automatically gets a clickable anchor link
- **Code blocks**: Fenced code blocks get syntax highlighting and a copy button
- **Mermaid diagrams**: Use ` ```mermaid` blocks for flowcharts and diagrams
- **KaTeX math**: Use `$...$` for inline math and `$$...$$` for display math

### File → URL Mapping

| File Path | URL |
|-----------|-----|
| `docs/en/index.md` | `/en/index` |
| `docs/en/get-started/installation.md` | `/en/get-started/installation` |
| `docs/zh/guides/markdown-syntax.md` | `/zh/guides/markdown-syntax` |

---

## 🌍 Internationalization

EasyDoc supports multiple languages out of the box. Each language has its own directory under `docs/`:

```text
documents/
├── en/    # English (default)
└── zh/    # 简体中文
```

### Adding a New Language

1. Create a new directory under `docs/` (e.g., `docs/fr/`)
2. Add your Markdown files following the same structure as `en/`
3. Add translations to `src/i18n/{lang}.ts`
4. Add the site configuration in `src/lib/siteConfig.ts`
5. Add the language to the language switcher in `src/components/LangSwitcher.tsx`

### Translation Keys

UI strings are managed via i18next files:

- `src/i18n/en.ts` — English
- `src/i18n/zh.ts` — 简体中文

---

## 📦 Build & Deploy

### Production Build

```bash
pnpm run build
```

The build process:
1. Generates the document registry from Markdown files
2. Runs TypeScript type checking
3. Builds the Vite application bundle
4. Generates MPA entry points for each documentation page

Build output is in the `dist/` directory — ready for static hosting.

### Deployment Targets

**Vercel** — Import your repository; Vercel auto-detects Vite and uses the correct build settings.

**Netlify** — Set the build command to `pnpm run build` and the publish directory to `dist`.

**GitHub Pages** — Use a GitHub Actions workflow to build and deploy the `dist/` directory:

```yaml
# .github/workflows/deploy.yml
- name: Build
  run: pnpm install && pnpm run build
- name: Deploy
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

**Any Static Host** — Upload the `dist/` directory to any static file server (Nginx, Apache, S3 + CloudFront, etc.).
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  <sub>Built with ❤️ by the <a href="https://easycoda.com">EasyCoda</a> React AI Agent Team</sub>
</p>