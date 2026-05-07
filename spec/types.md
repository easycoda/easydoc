# Shared TypeScript Types

All types live under `src/types/`. Every file uses `export type` / `export interface` with named exports.

---

## `src/types/doc.ts`

```typescript
/** Frontmatter parsed from a Markdown file */
export interface DocFrontmatter {
  title: string;
  description?: string;
  order?: number;
  sidebar?: boolean;   // whether to show in sidebar (default: true)
  toc?: boolean;       // whether to show TOC (default: true)
  [key: string]: unknown;
}

/** A heading extracted from the compiled HTML for TOC */
export interface TocHeading {
  id: string;
  text: string;
  level: number; // 2 for H2, 3 for H3
}

/** A document that has been fully resolved (HTML + metadata) */
export interface DocPageData {
  html: string;
  frontmatter: DocFrontmatter;
  headings: TocHeading[];
  lang: string;
  path: string; // residual path after lang prefix, e.g. "guide/getting-started"
}

/** One node in the documentation navigation tree */
export interface DocNavItem {
  title: string;
  path: string;        // full path including lang, e.g. "/en/guide/getting-started"
  children?: DocNavItem[];
  order?: number;
}

/** The full documentation manifest for a language */
export interface DocManifest {
  lang: string;
  nav: DocNavItem[];
}

/** A single entry in the search index */
export interface SearchIndexEntry {
  title: string;
  text: string;       // plain text content for search
  path: string;
  lang: string;
  section?: string;   // category for grouping, e.g. "Guide"
}

/** The entire search index */
export type SearchIndex = SearchIndexEntry[];
```

---

## `src/types/i18n.ts`

```typescript
/** Supported locale codes */
export type Locale = 'en' | 'zh';

/** Map of locale to display name */
export type LocaleDisplayMap = Record<Locale, string>;

/** UI translation keys for static UI strings */
export interface UITranslations {
  'nav.home': string;
  'nav.docs': string;
  'search.placeholder': string;
  'search.empty': string;
  'theme.light': string;
  'theme.dark': string;
  'theme.system': string;
  'toc.title': string;
  'sidebar.toggle': string;
  'notfound.title': string;
  'notfound.description': string;
  'notfound.back': string;
  'home.hero.title': string;
  'home.hero.subtitle': string;
  'home.hero.cta': string;
  'home.hero.secondary': string;
  'home.features.title': string;
  [key: string]: string;
}

/** A map of all UI translations, keyed by locale */
export type TranslationMap = Record<Locale, UITranslations>;
```

---

## `src/types/config.ts`

```typescript
import type { Locale } from './i18n';

/** Site-level configuration */
export interface SiteConfig {
  title: string;
  description: string;
  logo?: string;
  locales: Locale[];
  defaultLocale: Locale;
  /** Navigation links shown in the header */
  nav: NavLink[];
  /** Footer links */
  footer: FooterConfig;
  /** Social / external links */
  socialLinks?: SocialLink[];
}

export interface NavLink {
  text: string;
  link: string;
  /** If true, always shown regardless of locale */
  global?: boolean;
}

export interface FooterConfig {
  copyright: string;
  links: FooterLink[];
}

export interface FooterLink {
  text: string;
  link: string;
}

export interface SocialLink {
  icon: string; // lucide icon name
  link: string;
  label: string;
}
```

---

## `src/types/vite-plugin.ts`

```typescript
/** Options passed to the EasyDoc Vite plugin */
export interface EasyDocPluginOptions {
  /** Root directory containing language folders */
  docsRoot: string;
  /** Supported locales */
  locales: string[];
  /** Default locale */
  defaultLocale: string;
  /** Output directory (relative to Vite outDir) */
  outDir?: string;
}

/** Virtual module ID prefix for doc data */
export const VIRTUAL_DOC_PREFIX = 'virtual:easydoc-doc:';

/** Virtual module ID for the search index */
export const VIRTUAL_SEARCH_INDEX = 'virtual:easydoc-search-index';

/** Virtual module ID for the doc manifest */
export const VIRTUAL_MANIFEST_PREFIX = 'virtual:easydoc-manifest:';
```

---

## `src/types/store.ts`

```typescript
import type { Locale } from './i18n';

/** Zustand store for i18n / app state */
export interface AppState {
  /** Currently active locale */
  locale: Locale;
  /** Set the active locale */
  setLocale: (locale: Locale) => void;
}
```

---

## `src/types/hydration.ts`

```typescript
/** Data injected into each static HTML page for SPA hydration */
export interface HydrationData {
  lang: string;
  path: string;
  frontmatter: {
    title: string;
    description?: string;
    order?: number;
  };
  html: string;
  headings: Array<{ id: string; text: string; level: number }>;
}
```