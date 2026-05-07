# Overview: Emoji Rendering, Mermaid Lazy Loading & Build Optimization

## What Is Built & Primary User Value

Three incremental improvements to the EasyCoda documentation system:

1. **Emoji rendering**: Server-side Markdown compilation via `markdown-it-emoji` renders `:smile:` shortcodes into Unicode emoji characters (e.g., 😄) at SSG build time — no client-side JavaScript required.

2. **Mermaid lazy loading**: The Mermaid diagram library (~500KB+) is dynamically imported only when a document contains `<code class="language-mermaid">` blocks. Documents without diagrams avoid the download entirely, shrinking the main bundle and improving page load performance.

3. **Build optimization**: Source maps are enabled for production builds to aid debugging, and `rollup-plugin-visualizer` generates a `stats.html` bundle analysis report after every build.

## Architecture Notes

- Emoji rendering happens **entirely at build time** inside the `MarkdownCompiler` (SSG + dev virtual module resolution). The emitted HTML already contains Unicode emoji — no client changes.
- Mermaid lazy loading is a **client-side only** change inside `DocContent.tsx`. The `mermaid.initialize()` call and `processMermaidDiagrams()` function must adapt to the async dynamic import.
- Build configuration changes are isolated to `vite.config.ts` and `package.json`.