---
title: Configuration Guide
description: Complete reference for configuring EasyDoc — plugin options, site config, i18n, and build output.
order: 20
---
# Configuration Guide

## Configuration Overview

EasyDoc has two configuration layers, each controlling a different aspect of your documentation site:

1. **Plugin options** in `vite.config.ts` — controls build behavior: where docs live, which locales to build, and where output goes.
2. **Site config** in `src/lib/siteConfig.ts` — controls the rendered site: title, navigation, footer, social links, and SEO metadata.

Both layers are independent. The plugin reads your Markdown files and produces pre-rendered HTML; the site config defines the chrome (header, footer, locale switcher) around that content.

---

## Vite Plugin Configuration

EasyDoc ships as a Vite plugin inside your project. Add it to `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vitePluginEasyDoc } from "./src/plugins/vite-plugin-easydoc";
import type { EasyDocPluginOptions } from "./src/types/vite-plugin";

const easyDocOptions: EasyDocPluginOptions = {
  docsRoot: "docs/",
  locales: ["en", "zh"],
  defaultLocale: "en",
  // outDir: "docs-dist",  // Optional: custom output directory
};

export default defineConfig({
  plugins: [react(), vitePluginEasyDoc(easyDocOptions)],
});
```

### Plugin Options Reference

| Option | Type | Required | Default | Description |
|---|---|---|---|---|
| `docsRoot` | `string` | Yes | — | Root directory containing language subdirectories (e.g., `docs/en/`, `docs/zh/`). |
| `locales` | `string[]` | Yes | — | Supported locale codes. Must match the subdirectory names inside `docsRoot`. |
| `defaultLocale` | `string` | Yes | — | Default locale. Used for the home page redirect and as a fallback. |
| `outDir` | `string` | No | `dist` | Custom output directory for the built documentation site. |

---

## Site Configuration

The site config lives in `src/lib/siteConfig.ts` and uses the `SiteConfig` type from `src/types/config.ts`. This is the single source of truth for your site's title, navigation, footer, and SEO details.

```typescript
// src/lib/siteConfig.ts
import type { SiteConfig } from "../types/config";

export const siteConfig: SiteConfig = {
  title: 'EasyDoc',
  description: 'EasyDoc - A modern documentation site',
  baseUrl: 'https://docs.easycoda.com',
  ogImage: '/logo.png',
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  nav: [  // Header navigatation items
    {
      label: 'nav.home',
      path: '/'
    },
    {
      label: 'nav.getting-started', // i18n key — resolved via useTranslation()
      children: [
        {
          label: 'Getting Started', // i18n key — resolved via useTranslation()
          path: '/getting-started/getting-started',
        },
        {
          label: 'Configuration',
          path: '/getting-started/configuration',
        }
      ],
    },
    {
      label: 'nav.guide',
      children: [
        {
          label: 'Markdown Features',
          path: '/guides/markdown-syntax',
        },
        {
          label: 'Search',
          path: '/guides/search',
        },
      ],
    },
    {
      label: 'nav.github',
      path: 'https://github.com/easycoda/easydoc',
      external: true,
    },
  ],
  footer: {
    copyright: `© ${new Date().getFullYear()} EasyDoc. All rights reserved.`,
    links: [
      { text: 'EasyCoda', link: 'https://easycoda.com' },
      { text: 'GitHub', link: 'https://github.com/easycoda/easydoc' },
    ],
  },
  socialLinks: [
    {
      icon: 'Github',
      link: 'https://github.com/easycoda/easydoc',
      label: 'GitHub',
    },
    {
      icon: 'Twitter',
      link: 'https://twitter.com/@easy_coda',
      label: 'Twitter',
    },
  ],
};
```

### SiteConfig Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Site title. Used in the browser tab, header, and Open Graph meta tags. |
| `description` | `string` | Yes | Site description. Used in `<meta name="description">` and Open Graph tags. |
| `logo` | `string` | No | Path to the logo image displayed in the header. Typically `/logo.png` in public directory. |
| `baseUrl` | `string` | No | Canonical base URL for SEO. Prepended to paths in `<link rel="canonical">` and Open Graph image URLs. |
| `locales` | `Locale[]` | Yes | Supported locale codes. Must match the `locales` array in the plugin options. |
| `defaultLocale` | `Locale` | Yes | Default locale. Determines the site language on first visit. |
| `nav` | `NavLink[]` | Yes | Header navigation items. Supports nested dropdowns and external links. |
| `footer` | `FooterConfig` | Yes | Footer configuration including copyright text and link list. |
| `ogImage` | `string` | No | Open Graph image path (e.g., `/logo.png`). Prepended with `baseUrl` in meta tags. |
| `socialLinks` | `SocialLink[]` | No | Social or external links displayed in the site footer. Each item has an icon (Lucide icon name), link, and label. |

---

## NavLink Reference

Each item in `siteConfig.nav` is a `NavLink` with the following fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `label` | `string` | Yes | For parent menu items, use an i18n key (e.g., `"nav.guide"`). For child items, use the literal display text (e.g., `"Getting Started"`). |
| `path` | `string` | No | URL path or full URL. Omit for parent items that only serve as dropdown triggers. No language prefix needed. |
| `external` | `boolean` | No | If `true`, the link opens in a new tab with `rel="noopener noreferrer"`. |
| `children` | `NavLink[]` | No | Nested navigation items rendered as a dropdown menu on desktop and a collapsible section on mobile. |

Every item in `NavLink` will be rendered in header component.

### Navigation Rules

- **Parent items** (with `children`) do not need a `path`. They act as dropdown triggers.
- **Leaf items** (without `children`) require a `path` pointing to a document route or external URL.
- **i18n keys** like `"nav.guide"` are resolved at render time via the `useTranslation()` hook. Define the corresponding key in each locale file (see [i18n Configuration](#i18n-configuration)).

---

## i18n Configuration

EasyDoc uses a lightweight i18n system built on Zustand and TypeScript. All UI strings are defined as translation objects keyed by locale.

### Translation Files

Translation files live in `src/i18n/`:

- `src/i18n/en.ts` — English translations
- `src/i18n/zh.ts` — Chinese translations

Each file exports a default object conforming to the `UITranslations` interface:

```typescript
// src/i18n/en.ts
import type { UITranslations } from "@/types/i18n";

const en: UITranslations = {
  "nav.home": "Home",
  "nav.guide": "Guide",
  "search.placeholder": "Search documentation...",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.system": "System",
  "toc.title": "On This Page",
  "notfound.title": "Page Not Found",
  "notfound.back": "Back to Home",
  "home.hero.title": "Beautiful Documentation Made Simple",
  "home.hero.cta": "Get Started",
  "home.hero.secondary": "Learn More",
  "home.features.title": "Key Features",
  "sidebar.toggle": "Toggle sidebar",
  "doc.onThisPage": "On This Page",
  "doc.notFound": "Document not found.",
  "doc.loading": "Loading document...",
  "footer.copyright": "© 2026 EasyDoc. All rights reserved.",
};

export default en;
```

### UITranslations Interface

The `UITranslations` type (defined in `src/types/i18n.ts`) is an indexable string map. Known keys include:

| Key | Used In | Description |
|---|---|---|
| `nav.home` | Header / Home link | Home navigation label |
| `nav.guide` | Header navigation | Guide dropdown label |
| `nav.api` | Header navigation | API dropdown label |
| `nav.github` | Header navigation | GitHub link label |
| `search.placeholder` | Search input | Placeholder text |
| `search.empty` | Search results | Empty state message |
| `theme.light` | Theme switcher | Light mode label |
| `theme.dark` | Theme switcher | Dark mode label |
| `theme.system` | Theme switcher | System mode label |
| `toc.title` | Table of contents | TOC heading text |
| `sidebar.toggle` | Mobile sidebar | Toggle button aria-label |
| `doc.onThisPage` | Doc page | TOC heading text |
| `doc.notFound` | Doc page | 404 message |
| `doc.loading` | Doc page | Loading state |
| `notfound.title` | 404 page | Page title |
| `notfound.description` | 404 page | Description text |
| `notfound.back` | 404 page | Back-to-home link |
| `home.hero.title` | Home page | Hero heading |
| `home.hero.subtitle` | Home page | Hero subtitle |
| `home.hero.cta` | Home page | Primary CTA button |
| `home.hero.secondary` | Home page | Secondary CTA button |
| `home.features.title` | Home page | Features section heading |
| `footer.copyright` | Footer | Copyright text |

### useTranslation() Hook

Import `useTranslation` from `src/i18n/index.ts` to access the translation object for the current locale:

```typescript
import { useTranslation } from "@/i18n";

function MyComponent() {
  const t = useTranslation();
  return <h1>{t["home.hero.title"]}</h1>;
}
```

There is also a convenience wrapper `useT(key)` that returns a single string:

```typescript
import { useT } from "@/i18n";

function MyComponent() {
  const title = useT("home.hero.title");
  return <h1>{title}</h1>;
}
```

The hook reads the current locale from the Zustand `appStore`. If a key is missing in the current locale, it fallbacks to English.

### Adding a New Language

1. Create a new translation file: `src/i18n/fr.ts` (copy the structure from `en.ts`).
2. Add the locale to the `Locale` type in `src/types/i18n.ts`:

   ```typescript
   export type Locale = "en" | "zh" | "fr";
   ```

3. Register the translation in `src/i18n/index.ts`:

   ```typescript
   import fr from "./fr";

   const translations: Record<Locale, UITranslations> = { en, zh, fr };
   ```

4. Add the locale code to the `locales` array in both `vite.config.ts` (plugin options) and `src/lib/siteConfig.ts` (site config).
5. Create the corresponding docs directory: `docs/fr/`.

---

## Build Output

After running `pnpm run build`, the output directory contains:

```text
dist/
├── index.html                  # Home page (default locale)
├── search-index.json           # Full-text search index
├── manifest-en.json            # English navigation manifest
├── manifest-zh.json            # Chinese navigation manifest
├── stats.html                  # Bundle analysis report
├── robots.txt                  # Robots exclusion rules
├── logo.svg                    # Site logo (copied from docs/)
├── easycoda-runtime.min.js     # Minimal runtime helper
├── en/
│   ├── index.html              # English home page
│   ├── getting-started/
│   │   ├── getting-started.html
│   │   └── configuration.html
│   └── guides/
│       ├── search.html
│       └── markdown-syntax.html
├── zh/
│   ├── index.html              # Chinese home page
│   ├── guide/
│   │   ├── getting-started.html
│   │   └── installation.html
│   └── api/
│       └── config.html
└── assets/
    ├── index-<hash>.js         # Main client bundle
    ├── index-<hash>.css        # Main stylesheet
    ├── Doc-<hash>.js           # Document page chunk
    ├── Home-<hash>.js          # Home page chunk
    └── ...                     # Lazy-loaded chunks, fonts, etc.
```

You can organize files however you like within each language directory. The plugin scans recursively and builds the sidebar tree from the directory structure. There is no requirement for symmetric layouts between languages — each locale can have its own sections and page hierarchy.


Each `.html` file under `dist/<lang>/` is a **fully pre-rendered page**. It contains:

- **SSG content** inside `<div id="root">` — the rendered HTML of the document, visible to crawlers and users before JavaScript loads.
- **Hydration data** (`<script id="easydoc-hydration-data">`) — a JSON payload with the page's frontmatter, TOC headings, language, and doc path.
- A reference to the shared SPA bundle in `assets/` that handles client-side navigation, search, and theme toggling.
- SEO Header data.

The `search-index.json` file contains a flat array of `SearchIndexEntry` objects (title, plain-text content, path, lang) used for client-side full-text search.

The `manifest-<lang>.json` files contain the sidebar navigation tree for each locale, used at build time and for runtime navigation.

---

## Frontmatter Reference

Every Markdown document in `docs/` can include a YAML frontmatter block at the top. The following fields are recognized:

```yaml
---
title: My Page Title         # Required — used in <title>, sidebar, and breadcrumbs
description: A short summary  # Optional — used in <meta name="description">
order: 10                     # Optional — sort order in the sidebar (lower = first)
---
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | `string` | **Yes** | — | Document title. Displayed in the browser tab, sidebar, and page heading. |
| `description` | `string` | No | — | Brief description for `<meta name="description">` and Open Graph tags. |
| `order` | `number` | No | — | Sort order for the sidebar. Pages with lower `order` appear first. Pages without `order` sort alphabetically. |

`title` and `description` will also be used as header metadata.

## Troubleshooting

### Markdown files not showing

Make sure your Markdown files are inside a locale directory (`docs/en/`, `docs/zh/`, etc.). Files placed directly in the `docs/` root (outside any language directory) are ignored.

### Syntax highlighting not working

Verify that you are using fenced code blocks with a language identifier:

````text
❌ Wrong — no language specified:
```
const x = 1;
```

✅ Correct — language specified:
```typescript
const x = 1;
```
````

### 404 on nested routes

In development, Vite handles SPA fallbacks automatically. For production, configure your static file server to serve `index.html` for all routes:

**Nginx example:**

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```