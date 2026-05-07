---
title: Getting Started
description: Learn how to set up EasyDoc and create your first documentation site in under 5 minutes.
order: 10
---

# Getting Started

This guide walks you through setting up EasyDoc and creating your first documentation site. By the end, you will have a fully functional, multilingual documentation site running locally.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** 20.x or later
- **pnpm** 8.x or later (recommended), or npm / yarn
- A code editor (VS Code recommended)

## Clone the Project

EasyDoc is a self-documenting project — the documentation you are reading now is compiled and served by EasyDoc itself. The fastest way to get started is to clone the repository:

```bash
git clone https://github.com/easycoda/easydoc.git easydoc
cd easydoc
pnpm install
```

This gives you a fully working EasyDoc setup, including the Vite plugin, SSG pipeline, and all documentation pages.

## Start the Dev Server

Run the development server to preview your site locally:

```bash
pnpm dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser. You should see the landing page.

The dev server supports **Hot Module Replacement (HMR)** for Markdown files — any changes you make to `.md` files are reflected instantly in the browser. It also serves API endpoints at `/api/doc/:lang/*` for fetching document data during development.

## Write Your First Document

Open `docs/en/index.md` and customize the content. The file uses **YAML frontmatter** for metadata:

```yaml
---
title: My Documentation
description: A comprehensive guide to my project.
order: 0
---
```

Below the frontmatter, write standard Markdown:

```markdown
# My Documentation

Welcome to the official documentation for **My Project**.

## Getting Started

To install the project, run:

```bash
pnpm install my-project
```

## Directory Structure

EasyDoc uses a **locale-first** layout. Each language lives in its own top-level directory under `docsRoot`:

```text
docs/
├── en/
│   ├── index.md
│   ├── getting-started/
│   │   ├── getting-started.md
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

You can organize files however you like within each language directory. The plugin scans recursively and builds the sidebar tree from the directory structure. There is no requirement for symmetric layouts between languages — each locale can have its own sections and page hierarchy.

### Naming Conventions

- File names use **kebab-case** (e.g., `getting-started.md`, `markdown-syntax.md`).
- `index.md` serves as the landing page for its parent directory.
- Directory names become section labels in the sidebar (automatically formatted from kebab-case to Title Case).
- You can use English as directory name and specifiy translation for other languages in `src/i18n/{lang.ts}`.


## Add a New Page

Create a new file at `docs/en/guides/introduction.md`:

```markdown
---
title: Introduction
description: An overview of the project and its core concepts.
order: 20
---

# Introduction

This section covers the fundamental concepts and architecture of the project.

## Architecture Overview

The project follows a **modular architecture** with clear separation of concerns.

### Core Modules

| Module    | Description                    |
|-----------|--------------------------------|
| `core`    | Core business logic            |
| `runtime` | Runtime environment            |
| `plugins` | Plugin system                  |
| `utils`   | Shared utility functions       |
```

The new page automatically appears in the sidebar navigation, sorted by its `order` value.

## Add Code Examples

You can include syntax-highlighted code blocks in any supported language:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

function getUserDisplayName(user: User): string {
  return `${user.name} <${user.email}>`;
}
```

```python
def fibonacci(n: int) -> list[int]:
    """Return the first n Fibonacci numbers."""
    seq = [0, 1]
    for _ in range(n - 2):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

print(fibonacci(10))
```

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  animation: fade-in 0.6s ease-out;
}
```

## Build for Production

When you are ready to deploy, build the static site:

```bash
pnpm build
```

The output is in the `dist/` directory. The build produces fully pre-rendered HTML pages for every document — each page has server-side rendered content in `<div id="root">` that React hydrates on load via `hydrateRoot`. This makes the site SEO-friendly and fast on first paint. The resulting static files can be deployed to any CDN or static file host (Netlify, Vercel, GitHub Pages, S3 + CloudFront, etc.).

## Next Steps

- Explore the full [configuration options](/en/getting-started/configuration).
- Dive into the [Markdown syntax guide](/en/guides/markdown-syntax) for all supported features.