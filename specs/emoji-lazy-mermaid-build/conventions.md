# Conventions (Delta)

All existing conventions from `spec/conventions.md` apply. These changes introduce no new conventions.

## Specific notes for these changes

- **Imports**: Use ESM `import` syntax. For `markdown-it-emoji`, use `import markdownItEmoji from 'markdown-it-emoji'` (or `import * as markdownItEmoji` depending on the package's export structure — verify with `@types/markdown-it-emoji` or package documentation).
- **Dynamic imports**: Use `const mod = await import('mermaid')` with `mod.default` to access the default export. Vite will code-split this automatically.
- **Plugin initialization**: `markdown-it-emoji` registration follows the same pattern as existing plugins (`markdown-it-anchor`, `markdown-it-texmath`) in the `MarkdownCompiler` constructor.
- **Visualizer**: Imported only for side effects. The plugin is added conditionally or always; if always, it only generates output during `vite build` due to Rollup lifecycle.