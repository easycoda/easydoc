# API / Data Layer

EasyDoc is a static site with no backend API server. All "data fetching" is done at build time (Vite plugin compiles Markdown → HTML) or at runtime from pre-built JSON/HTML files. TanStack Query is used for data loading and caching.

---

## Data Sources

### 1. Virtual Modules (Vite Plugin)
The Vite plugin transforms the Markdown file tree into virtual modules that can be imported in client code.

### 2. Static JSON Files (Build Output)
The plugin writes JSON files to the output directory for the search index and manifests.

### 3. Static HTML Files (Build Output)
Each `.md` file produces a static `.html` page at the corresponding route path.

---

## API Functions

All functions are in `src/services/docService.ts`.

### `fetchDocPage(lang: string, path: string): Promise<DocPageData>`

- **HTTP Method:** N/A (imports virtual module or fetches JSON)
- **Endpoint:** Imports `virtual:easydoc-doc:${lang}/${path}` at build time. At dev time, resolves to the compiled markdown data. In production (hydration scenario), may fetch from a pre-built JSON chunk or read from `window.__HYDRATION_DATA__`.
- **Request:** `{ lang: string; path: string }`
- **Response:** `DocPageData`
- **TanStack Query:** `useQuery({ queryKey: ['doc', lang, path], queryFn: () => fetchDocPage(lang, path) })`
- **Calling Component:** `DocPage`

### `fetchDocManifest(lang: string): Promise<DocManifest>`

- **HTTP Method:** N/A
- **Endpoint:** Imports `virtual:easydoc-manifest:${lang}` at build time. At runtime fetches `/manifest-${lang}.json`.
- **Request:** `{ lang: string }`
- **Response:** `DocManifest`
- **TanStack Query:** `useQuery({ queryKey: ['manifest', lang], queryFn: () => fetchDocManifest(lang) })`
- **Calling Component:** `Layout` or `DocSidebar`

### `fetchSearchIndex(): Promise<SearchIndex>`

- **HTTP Method:** GET
- **Endpoint:** `/search-index.json` (pre-built at compile time)
- **Request:** none
- **Response:** `SearchIndex`
- **TanStack Query:** `useQuery({ queryKey: ['search-index'], queryFn: () => fetchSearchIndex(), staleTime: Infinity })`
- **Calling Component:** `SearchDialog`

---

## Hydration Data Contract

At build time, each static HTML page includes a `<script>` tag:

```html
<script>
  window.__HYDRATION_DATA__ = {
    lang: "en",
    path: "guide/getting-started",
    frontmatter: { title: "Getting Started", description: "..." },
    html: "<div>...</div>",
    headings: [{ id: "getting-started", text: "Getting Started", level: 2 }]
  };
</script>
```

On SPA hydration, `DocPage` checks `window.__HYDRATION_DATA__` first (for the initial page load) before falling back to the virtual module import / JSON fetch for subsequent client-side navigations.