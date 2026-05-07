# SSG Home Page + SEO Meta Specification

## 1 Overview

This feature implements SSG pre-rendering for the landing/home page (`/`) and per-language home pages (`/:lang`), and injects comprehensive SEO meta tags into every generated static HTML file. Currently, the root `dist/index.html` is an empty SPA shell, and `/:lang` routes redirect to the first documentation page. After this feature, both route families will serve pre-rendered home page content (HeroSection + FeatureCards) with locale-specific text, and every generated HTML file will carry proper `<title>`, `<meta name="description">`, Open Graph, and canonical link tags.

---

## 2 Pages & Routes

| Route Path | Component Name | File Path | Auth Required | SSG Output |
|---|---|---|---|---|
| `/` | `HomePage` | `src/pages/Home.tsx` | No | `dist/index.html` |
| `/:lang` | `LangHomePage` (new) | `src/pages/LangHome.tsx` | No | `dist/<lang>/index.html` |
| `/:lang/*` | `DocPage` | `src/pages/Doc.tsx` | No | `dist/<lang>/<path>/index.html` |
| `*` | `NotFoundPage` | `src/pages/NotFound.tsx` | No | N/A (SPA fallback) |

**Route change:** `/:lang` currently renders `LangIndexPage` which redirects. After this change, `/:lang` renders `LangHomePage` which displays the localized home page (HeroSection + FeatureCards). The redirect-to-first-doc behavior is removed.

---

## 3 Component Map

### 3.1 `HomePage` (`src/pages/Home.tsx`) — unchanged

Responsibility: Compose HeroSection + FeatureCards for the root `/` route.
- Props: None
- Data received: None directly; child components read locale from `useAppStore`
- Callbacks emitted: None

### 3.2 `LangHomePage` (`src/pages/LangHome.tsx`) — NEW

Responsibility: Render the localized home page for `/:lang`. Validates the `lang` param against `siteConfig.locales`, sets the app locale via `useAppStore.setLocale`, and renders `HomePage`. If the `lang` param is invalid, redirects to `/<defaultLocale>`.

- Props: None
- Data received: `lang` from `useParams<{ lang: string }>()`, locale from `useAppStore`, `siteConfig` for locale validation
- Callbacks emitted: `setLocale(lang)` on mount/param change
- States:
  - **Valid lang:** Renders `<HomePage />`
  - **Invalid lang:** Redirect to `/<siteConfig.defaultLocale>` via `useNavigate` + `useEffect`
  - **Loading/hydration:** Inherits SSG pre-rendered content via `__HYDRATION_DATA__`

### 3.3 `HeroSection` (`src/components/HeroSection.tsx`) — unchanged

Responsibility: Display hero headline, subtitle, description, and CTA buttons using i18n strings.
- Props: None (reads locale from Zustand `useAppStore` via `useTranslation`)
- Data: i18n keys `home.hero.title`, `home.hero.subtitle`, `home.description`, `home.hero.cta`, `home.hero.secondary`
- Callbacks: `Link` navigation to `/en/guide/getting-started` (or locale-equivalent) and `/:lang/`
- shadcn/ui: `Button`

### 3.4 `FeatureCards` (`src/components/FeatureCards.tsx`) — unchanged

Responsibility: Display a grid of 4 feature cards with icon, title, and description from i18n.
- Props: None (reads locale from Zustand `useAppStore` via `useTranslation`)
- Data: i18n keys `home.features.title`, `features.markdown.*`, `features.multilang.*`, `features.search.*`, `features.theme.*`
- shadcn/ui: `Card`, `CardHeader`, `CardTitle`, `CardDescription`

### 3.5 `LanguageSwitcher` (`src/components/LanguageSwitcher.tsx`) — minor update

Responsibility: Switch locale and navigate to the equivalent page in the target language.
When switching from `/` to a locale, navigate to `/<targetLocale>` (the LangHomePage).
When switching from `/:lang/*` doc page, preserve the residual path.
Current `buildSwitchedPath` already handles this correctly — no code change needed, just verifying behavior.

---

## 4 Shared TypeScript Types

### 4.1 Updated: `src/types/hydration.ts`

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

/**
 * Home page SSG hydration data.
 * Lighter than HydrationData — no Markdown HTML or headings.
 */
export interface HomeHydrationData {
  lang: string;
  /** Whether this is the root home page (/) or a lang home page (/:lang) */
  path: '' | string;
  title: string;
  description: string;
  /** The full pre-rendered HTML for the home page body */
  html: string;
}
```

### 4.2 New: `src/types/seo.ts`

```typescript
/**
 * SEO meta tags configuration generated at build time for each HTML page.
 */
export interface SeoMeta {
  /** <title> tag content */
  title: string;
  /** <meta name="description"> content */
  description: string;
  /** Canonical URL, e.g. "https://easydoc.dev/en/guide/getting-started" */
  canonical: string;
  /** Open Graph type, defaults to "website" */
  ogType: 'website' | 'article';
  /** Open Graph title */
  ogTitle: string;
  /** Open Graph description */
  ogDescription: string;
  /** Open Graph URL */
  ogUrl: string;
  /** Open Graph image (optional) */
  ogImage?: string;
  /** Page language (for <html lang=""> ) */
  lang: string;
}
```

### 4.3 Addition to `src/types/config.ts`

```typescript
// Add to SiteConfig:
export interface SiteConfig {
  // ... existing fields
  /** Production base URL for canonical links and OG URLs, e.g. "https://easydoc.dev" */
  baseUrl?: string;
}
```

---

## 5 State Architecture

| State | Type | Default | Owner | Scope |
|---|---|---|---|---|
| `locale` | `Locale` | `'en'` (or localStorage) | `useAppStore` (`src/store/appStore.ts`) | Global (Zustand) |
| Hydration data | `HydrationData \| HomeHydrationData \| null` | `window.__HYDRATION_DATA__` | SSG HTML `<script>` | Per-page, read-only at boot |
| Doc page data | `DocPageData` | TanStack Query cache | `useDocData` hook | Per-query |
| Manifest | `DocManifest` | TanStack Query cache | Layout → `useQuery` | Per-language |

**New/Changed:**
- `LangHomePage` calls `useAppStore.setLocale(lang)` on mount when `lang` param differs from current locale.
- No new store modules required.

---

## 6 API / Data Layer

No new API endpoints. The SSG generation happens at build time inside the Vite plugin.

### Existing service functions reused:
- `fetchDocManifest(lang)` — used by Layout, unaffected
- `fetchDocPage(lang, path)` — used by DocPage, unaffected
- `fetchSearchIndex()` — used by SearchDialog, unaffected

---

## 7 SSG Home Page Strategy

### Chosen Approach: Static HTML Template Injection with i18n String Resolution

**Rationale:** Using `renderToString` in the Vite plugin's `closeBundle` hook would require importing React components from the source build, which is complex in the Vite plugin context (the plugin runs in Node.js, and React components use browser APIs like `useContext`, Tailwind class resolution, etc.). The components also depend on runtime state (`useAppStore`, `useTranslation`), making server-side rendering non-trivial without a full SSR setup.

**Instead, the plugin generates home page HTML using a hand-crafted template that mirrors the DOM structure of `HeroSection` + `FeatureCards` with localized strings resolved from the i18n translation files at build time.** This is the approach used by most SSG frameworks (VitePress, Docusaurus, Hugo) for non-content template pages.

### How it works:

1. **Build-time:** In `closeBundle`, after reading the built `dist/index.html` template:
   a. For each locale (`en`, `zh`), read the i18n translation file (`src/i18n/<lang>.ts`)
   b. Resolve the home page i18n keys to their localized strings
   c. Generate a static HTML snippet that mirrors the structure of `HeroSection` + `FeatureCards`
   d. Inject this HTML into the `<div id="root">` of the template
   e. Inject SEO meta tags
   f. Write `dist/index.html` (root, using default locale) and `dist/<lang>/index.html` (per locale)

2. **The static HTML template** for the home page uses the same Tailwind utility classes as the React components, ensuring visual consistency. It includes:
   - Hero section with badge, title, description, CTA buttons (as `<a>` tags)
   - Feature cards grid (4 cards with icons, titles, descriptions)
   - All text is pre-localized

3. **Hydration:** The generated `<script>window.__HYDRATION_DATA__</script>` carries `HomeHydrationData`, which tells React that this is a home page with specific locale. On hydration, the `HomePage`/`LangHomePage` React component matches the pre-rendered DOM (since the static template mirrors the React component structure exactly) and attaches event listeners without re-rendering.

### Why not renderToString?

- `HeroSection` and `FeatureCards` both call `useTranslation()`, which reads from `useAppStore` (Zustand). This requires a React context provider tree to be set up in Node.js.
- Tailwind CSS classes are resolved at build time by Tailwind's JIT compiler — but in SSR context, the component renders to class name strings, not resolved styles. This is fine for static HTML (class names are preserved), but the setup cost outweighs the benefit for two simple components.
- The static template approach is simpler, more predictable, and avoids adding `react-dom/server` as a dependency for a build-time script.

---

## 8 SEO Meta Tag Injection

### Meta tags per page type:

**Home page (`/` and `/:lang`):**
```html
<title>[localized title from siteConfig/i18n]</title>
<meta name="description" content="[localized description]" />
<meta property="og:title" content="[localized title]" />
<meta property="og:description" content="[localized description]" />
<meta property="og:type" content="website" />
<meta property="og:url" content="[baseUrl]/[lang]" />
<meta property="og:image" content="[baseUrl]/og-image.png" />
<link rel="canonical" href="[baseUrl]/[lang]" />
```

**Doc pages (`/:lang/*`):**
```html
<title>[frontmatter.title] | [siteConfig.title]</title>
<meta name="description" content="[frontmatter.description || siteConfig.description]" />
<meta property="og:title" content="[frontmatter.title] | [siteConfig.title]" />
<meta property="og:description" content="[frontmatter.description || siteConfig.description]" />
<meta property="og:type" content="article" />
<meta property="og:url" content="[baseUrl]/[lang]/[path]" />
<link rel="canonical" href="[baseUrl]/[lang]/[path]" />
```

### Implementation:
A helper function `applySeoMeta(html: string, meta: SeoMeta): string` replaces/inserts meta tags in the HTML `<head>` using regex. If a `baseUrl` is configured in `siteConfig`, canonical and OG URLs are absolute; otherwise they are relative.

---

## 9 Conventions

- File naming: kebab-case for all files; PascalCase for React components
- Import alias: `@/` → `src/`
- Named exports everywhere (no default exports for components)
- Type files: `src/types/` directory
- i18n key format: `section.subsection.key` (e.g., `home.hero.title`)
- SSG helper functions: added to `src/plugins/vite-plugin-easydoc.ts` or extracted to `src/plugins/ssg-home.ts`