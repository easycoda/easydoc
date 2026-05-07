# Build Flow

## Development (`vite dev`)

```
1. Vite starts dev server on 0.0.0.0:8080
2. vite-plugin-easydoc:
   a. Scans docs/ directory
   b. Creates virtual modules for all .md files
   c. Creates virtual manifest modules per language
   d. Creates virtual search-index module
   e. Serves virtual JSON endpoints for manifest and search index
3. React Router renders:
   a. / → HomePage
   b. /:lang → LangIndexPage (redirect to first doc)
   c. /:lang/* → DocPage (loads virtual doc module via TanStack Query)
4. HMR on .md file changes triggers DocPage re-render
```

---

## Production Build (`vite build`)

```
1. TypeScript compilation (tsc -b)
2. Vite build:
   a. vite-plugin-easydoc transformIndexHtml:
      - For each .md file, generates a static HTML page at dist/<lang>/<path>/index.html
      - Injects the compiled Markdown HTML content into <div id="root"> as pre-rendered SSG content
      - Injects hydration <script> with __HYDRATION_DATA__ for each page
   b. Standard Vite bundle → dist/assets/
   c. Plugin buildEnd:
      - Emits dist/search-index.json
      - Emits dist/manifest-<lang>.json for each language
3. Output structure:
   dist/
     index.html              (Home page)
     en/
       index.html            (Language index)
       guide/
         getting-started/
           index.html
         installation/
           index.html
       api/
         config/
           index.html
     zh/
       index.html
       guide/
         getting-started/
           index.html
         ...
     search-index.json
     manifest-en.json
     manifest-zh.json
     assets/
       index-<hash>.js
       index-<hash>.css
```

---

## SSG Pre-Rendering & SPA Hydration Flow

### Build-Time SSG
At build time, the Vite plugin compiles every `.md` file to HTML and injects the rendered content directly into the `<div id="root">` of the corresponding static HTML page. This means every `dist/<lang>/<path>/index.html` contains the fully rendered document content — visible to search engine crawlers and users before JavaScript loads.

### Client Hydration & CSR Transition

```
1. Browser requests /en/guide/getting-started
2. Server returns dist/en/guide/getting-started/index.html
3. HTML contains:
   - <div id="root"> with pre-rendered SSG content (the compiled Markdown HTML)
   - <script>window.__HYDRATION_DATA__ = { ... }</script>
   - <script src="/assets/index-<hash>.js"></script>
4. Browser immediately renders the pre-rendered HTML (content visible instantly)
5. React bundle loads and hydrates:
   a. React's hydrateRoot attaches event listeners to the existing DOM (does NOT re-render)
   b. DocPage reads window.__HYDRATION_DATA__ and places it into TanStack Query cache as initial data
   c. After hydration, the page is interactive (event listeners attached, React state active)
6. User clicks a sidebar link → React Router navigates client-side (CSR from this point on)
   a. DocPage re-renders with new params
   b. In dev: imports virtual module; in prod: fetches JSON chunk or uses virtual import
   c. The DOM is fully replaced by React for subsequent navigations
7. Search, theme, language changes all work as SPA interactions
```

### Key Architecture Points
- **First load:** SSG pre-rendered HTML → `hydrateRoot` (no re-render, no flicker)
- **Subsequent navigation:** Full CSR via React Router (no full-page reload)
- **SEO:** Crawlers see fully rendered content in `<div id="root">` without executing JavaScript
- **No server required:** All HTML files are static — deployable to any CDN or static file host