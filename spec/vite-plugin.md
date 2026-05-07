# Vite Plugin Design

## `vite-plugin-easydoc` (in-repo plugin)

**File:** `src/plugins/vite-plugin-easydoc.ts`

The plugin handles the entire Markdown-to-HTML compilation pipeline during Vite's `dev` and `build` phases.

---

### Plugin Lifecycle Hooks

#### `configResolved`
- Reads the resolved Vite config to determine `root`, `outDir`.
- Validates that the `docsRoot` directory exists.

#### `resolveId`
- Intercepts imports matching:
  - `virtual:easydoc-doc:*` → resolves to individual doc modules
  - `virtual:easydoc-manifest:*` → resolves to manifest modules
  - `virtual:easydoc-search-index` → resolves to search index module

#### `load`
- For doc virtual modules (`virtual:easydoc-doc:en/guide/getting-started`):
  1. Reads the `.md` file from `docsRoot/en/guide/getting-started.md`
  2. Parses frontmatter (using `gray-matter` or similar)
  3. Compiles markdown to HTML (using `markdown-it` or `remark`)
  4. Applies syntax highlighting to code blocks (Shiki)
  5. Processes KaTeX math blocks
  6. Processes Mermaid diagram blocks (wraps in `<pre class="mermaid">`)
  7. Extracts headings (H2, H3) with auto-generated IDs
  8. Returns JS module exporting `{ html, frontmatter, headings }`

- For manifest virtual modules:
  1. Walks the `docsRoot/<lang>/` directory tree
  2. Reads frontmatter from each `.md` to get `title`, `order`
  3. Builds a tree structure from the directory layout
  4. Returns JS module exporting `{ lang, nav: [...] }`

- For search index virtual module:
  1. Walks all `.md` files across all languages
  2. Reads frontmatter and strips markdown syntax to extract plain text
  3. Returns JS module exporting an array of `SearchIndexEntry`

#### `transformIndexHtml` (build only)
- Reads the `index.html` template and for each doc route during build:
  1. Compiles the corresponding `.md` file to HTML (reusing the markdown processing pipeline)
  2. Writes the compiled HTML content **inside `<div id="root">`** of the template, replacing the empty placeholder — this is the SSG pre-rendered content visible to crawlers
  3. Injects the hydration `<script>` tag with `__HYDRATION_DATA__` containing the same compiled doc data
  4. Emits the resulting static HTML file to the correct path (`dist/<lang>/<path>/index.html`)

#### `buildEnd` (build only)
- Generates `search-index.json` into the output directory.
- Generates per-language `manifest-<lang>.json` files.
- Uses Vite's `emitFile` API to include these as static assets.
- Also calls `transformIndexHtml` for the home page (`/`) and language index pages (`/:lang`) to inject pre-rendered SSG content where applicable.

#### `configureServer` (dev only)
- Adds middleware to serve `search-index.json` and `manifest-<lang>.json` from memory.
- Ensures HMR works for `.md` file changes.

---

### Markdown Processing Pipeline

```
.md file
  → gray-matter (extract frontmatter + content)
  → markdown-it (parse to tokens)
    → markdown-it-katex (math rendering)
    → markdown-it-shiki (syntax highlighting)
  → Custom renderer (Mermaid → <pre class="mermaid">)
  → Heading extraction (H2/H3 → TocHeading[])
  → Output: { html: string, frontmatter: DocFrontmatter, headings: TocHeading[] }
```

---

### Dependencies (to be added to `package.json`)

```
gray-matter        — frontmatter parsing
markdown-it        — Markdown parser
markdown-it-anchor — auto-generate heading IDs
shiki              — syntax highlighting
katex              — math rendering
mermaid            — diagram rendering
fuse.js            — client-side fuzzy search
```