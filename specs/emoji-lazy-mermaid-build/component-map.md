# Component Map

## 1. MarkdownCompiler (class in `src/plugins/vite-plugin-easydoc.ts`)

- **Responsibility**: Server-side Markdown-to-HTML compilation used during SSG build and dev virtual module resolution.
- **What changes**: Add `markdown-it-emoji` plugin in the constructor.
- **Props/data received**: None (it's a class, not a React component). Receives raw Markdown strings via `compile(raw: string)`.
- **Callbacks/mutations emitted**: Outputs `{ html, frontmatter, headings }` from `compile()`.
- **shadcn/ui primitives**: N/A (server-side only).

## 2. DocContent (`src/components/DocContent.tsx`)

- **Responsibility**: Renders compiled document HTML inside a `div` with `ref={contentRef}`, processes Mermaid diagrams, extracts TOC headings, sets up IntersectionObserver for scroll-spy, and intercepts internal link clicks for client-side navigation.
- **Props received**: `DocContentProps` — `html: string`, `frontmatter: DocFrontmatter`, `headings: TocHeading[]`, `onHeadingsReady?: (headings: TocHeading[]) => void`, `onHeadingsVisible?: (headingId: string) => void`.
- **Callbacks/mutations emitted**: `onHeadingsReady(headings)` when DOM headings are extracted; `onHeadingsVisible(headingId)` when a heading scrolls into view.
- **What changes**:
  - Remove top-level `import mermaid from 'mermaid'`.
  - Add a module-level `mermaidModule: typeof mermaid | null` cache variable.
  - Add a `loadMermaid(): Promise<typeof mermaid>` async function that dynamically imports mermaid only when needed.
  - Modify `processMermaidDiagrams()` to first check if the container has any `.language-mermaid` elements; if yes, call `loadMermaid()` before `mermaid.run()`.
  - Modify `initializeContent()` so `mermaid.initialize()` is called via the dynamically loaded module.
- **shadcn/ui primitives**: None used directly (the component uses raw `<article>` and `<div>`).

## 3. vite.config.ts

- **Responsibility**: Vite build configuration.
- **What changes**:
  - Add `build.sourcemap: true`.
  - Import and add `rollup-plugin-visualizer` to the plugins array (gated to `mode === 'build'` or always, using `emitFile: true`).
- **shadcn/ui primitives**: N/A.

## 4. package.json

- **Responsibility**: Project dependency manifest.
- **What changes**:
  - Add `markdown-it-emoji` to `dependencies`.
  - Add `rollup-plugin-visualizer` to `devDependencies`.