# Spec: EN Configuration — `docs/en/getting-started/configuration.md`

## Current State (Problems)
- References `easycoda-vite/plugin` import (FICTIONAL)
- References `easyDocPlugin` with options `docsDir`, `outputDir`, `siteName`, `defaultDescription` — none of these match the real `EasyDocPluginOptions`
- Describes a manual sidebar override via `src/config/sidebar.ts` with `SidebarConfig` type (FICTIONAL)
- Shows `ThemeProvider` usage in `main.tsx` as user-facing API — this is internal, not user-configurable in that way
- Describes fictional build output (`dist/docs/` with `.html` files)
- Mentions CSS custom property overrides (`--color-primary`, etc.) that don't exist as documented public API
- Shows `no-copy` code block feature that doesn't exist
- Shows `{#custom-id}` heading anchor override that markdown-it-anchor supports — but verify if actually working

## Required Changes

### REMOVE
1. "Vite Config" section with fictional `easycoda-vite/plugin` import and fictional options
2. "Manual Sidebar Override" section — the sidebar is auto-generated from directory structure, no manual override exists
3. "Sidebar Options" table — fictional API
4. "Theme Configuration" section — theme is internal, not user-exposed config
5. "Custom Heading Anchors" section — `{#custom-id}` behavior should be verified; remove if not supported
6. "Code Block Features" section about `no-copy` — this doesn't exist in the source

### REPLACE WITH: "Configuration Overview"
Explain: EasyDoc has two configuration layers:
1. **Plugin options** in `vite.config.ts` — controls build behavior (docs root, locales, output dir)
2. **Site config** in `src/lib/siteConfig.ts` — controls the rendered site (title, nav, footer, etc.)

### ADD: "Vite Plugin Configuration"
Show the real plugin options (pulled from `EasyDocPluginOptions`):

```typescript
// vite.config.ts
import { vitePluginEasyDoc } from './src/plugins/vite-plugin-easydoc';
import type { EasyDocPluginOptions } from './src/types/vite-plugin';

const easyDocOptions: EasyDocPluginOptions = {
  docsRoot: 'docs/',
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  // outDir: 'docs-dist',  // Optional: custom output directory
};
```

### ADD: "Site Configuration"
Show the real `SiteConfig` type and where it lives:

```typescript
// src/lib/siteConfig.ts
import type { SiteConfig } from '../types/config';

export const siteConfig: SiteConfig = {
  title: 'My Documentation',
  description: 'A documentation site powered by EasyDoc.',
  logo: '/logo.svg',
  baseUrl: 'https://docs.example.com',
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  nav: [
    {
      label: 'nav.guide',       // i18n key
      children: [
        { label: 'Getting Started', path: '/en/getting-started/getting-started' },
        { label: 'Installation', path: '/en/getting-started/installation' },
      ],
    },
    { label: 'nav.github', path: 'https://github.com/user/repo', external: true },
  ],
  footer: {
    copyright: '© 2026 My Project.',
    links: [
      { text: 'GitHub', link: 'https://github.com/user/repo' },
    ],
  },
  ogImage: '/logo.svg',
  socialLinks: [
    { icon: 'Github', link: 'https://github.com/user/repo', label: 'GitHub' },
  ],
};
```

### ADD: "SiteConfig Reference"
Full reference table for each `SiteConfig` field:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Site title |
| `description` | `string` | Yes | Site description for meta tags |
| `logo` | `string` | No | Path to logo image |
| `baseUrl` | `string` | No | Canonical base URL for SEO meta tags |
| `locales` | `Locale[]` | Yes | Supported locale codes |
| `defaultLocale` | `Locale` | Yes | Default locale |
| `nav` | `NavLink[]` | Yes | Header navigation items |
| `footer` | `FooterConfig` | Yes | Footer configuration |
| `ogImage` | `string` | No | Open Graph image path |
| `socialLinks` | `SocialLink[]` | No | Social/external links |

### ADD: "NavLink Reference"

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | `string` | Yes | Display text or i18n key (e.g., `nav.guide`) |
| `path` | `string` | No | URL path. Omit for parent items with children |
| `external` | `boolean` | No | If `true`, opens in new tab |
| `children` | `NavLink[]` | No | Nested navigation items (dropdown menu) |

### ADD: "i18n Configuration"
Explain the real i18n system:
- Translation keys in `src/i18n/en.ts` and `src/i18n/zh.ts`
- Both export a `UITranslations` object
- Keys used in nav labels (e.g., `nav.guide`), search, theme, TOC, 404, home page
- `useTranslation()` hook reads current locale from Zustand store
- Adding a new language: create `src/i18n/<code>.ts`, add to `locales` array

### ADD: "Build Output"
Show the real build output structure:

```text
dist/
├── index.html                  # Home page (default locale)
├── search-index.json           # Full-text search index
├── manifest-en.json            # English navigation manifest
├── manifest-zh.json            # Chinese navigation manifest
├── stats.html                  # Bundle analysis
├── en/
│   ├── index.html
│   ├── getting-started/
│   │   ├── getting-started/
│   │   │   └── index.html
│   │   ├── installation/
│   │   │   └── index.html
│   │   └── configuration/
│   │       └── index.html
│   └── guides/
│       ├── markdown-syntax/
│       │   └── index.html
│       └── search/
│           └── index.html
├── zh/
│   └── ... (mirrors en structure)
└── assets/
    ├── index-<hash>.js
    └── index-<hash>.css
```

Explain: Each `.html` file under `dist/<lang>/` is a fully pre-rendered page with SSG content in `<div id="root">` and a hydration script. The shared SPA bundle in `assets/` handles client-side interactivity and navigation.

### ADD: "Frontmatter Reference"
(repeated from installation for completeness):

```yaml
---
title: My Page Title           # Required
description: A description.    # Optional
order: 10                      # Optional - sidebar sort order
sidebar: false                 # Optional - hide from sidebar (default: true)
toc: false                     # Optional - hide table of contents (default: true)
---
```