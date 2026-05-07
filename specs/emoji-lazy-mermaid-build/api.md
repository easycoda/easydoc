# API / Data Layer

## Emoji Rendering (Server-Side)

No API calls. The `markdown-it-emoji` plugin is used inside `MarkdownCompiler` at build time. It transforms emoji shortcodes (e.g., `:smile:`) into Unicode characters during `md.render()`.

**Plugin registration (in MarkdownCompiler constructor):**

| Item | Detail |
|---|---|
| Plugin | `markdown-it-emoji` |
| Registration | `this.md.use(require('markdown-it-emoji'))` (or ESM import) |
| Effect | All `:shortcode:` patterns in Markdown are replaced with corresponding Unicode emoji in the output HTML |

## Mermaid Lazy Loading (Client-Side)

| Function name | Type | Endpoint | Request type | Response type | Query hook | Calling component |
|---|---|---|---|---|---|---|
| `loadMermaid()` | Dynamic `import()` | N/A (code-split chunk) | N/A | `typeof import('mermaid').default` | N/A (plain async function) | `processMermaidDiagrams()` in `DocContent` |

The dynamic `import('mermaid')` triggers Vite to split Mermaid into a separate chunk. This chunk is only fetched when `processMermaidDiagrams()` detects `.language-mermaid` elements in the DOM.

## Build Optimization

| Item | Detail |
|---|---|
| `rollup-plugin-visualizer` | Runs at build time, outputs `stats.html` in the build output directory |
| `build.sourcemap` | Vite built-in; set to `true` to generate `.map` files alongside output assets |