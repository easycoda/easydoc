# Task Plan: Fix KaTeX/Mermaid Regex Matching

## Dependency Graph

```
task-1 (KaTeX inline plugin)
  │
  ├──> task-3 (Mermaid fence guard + cleanup)
  │
task-2 (KaTeX display plugin)
  │
  └──> task-3 (Mermaid fence guard + cleanup)
```

Tasks 1 and 2 are independent and can run in parallel. Task 3 depends on both.

---

## Task List

### task-1: Implement KaTeX inline plugin

- **Title:** Add markdown-it custom plugin for KaTeX inline math (`$...$`)
- **Depends on:** (none)
- **Context files:**
  - `src/plugins/vite-plugin-easydoc.ts`
  - `specs/fix-katex-mermaid/spec.md`
  - `specs/fix-katex-mermaid/requirements.md`
- **Output files:**
  - `src/plugins/vite-plugin-easydoc.ts` (modified)

**Description:**

Define and register a markdown-it plugin function `katexInlinePlugin` inside `src/plugins/vite-plugin-easydoc.ts`. The plugin must:

1. Register a custom inline rule named `'katex_inline'` via `md.inline.ruler.push(...)` that scans only `text` tokens (not `code_inline`, `html_inline`, etc.) for `$...$` delimiters.

2. The inline rule's boundary logic:
   - Opening `$` at position `pos`: must exist, must NOT be preceded by a word character (`\w`) or backslash (`\`), and the next character must NOT be whitespace.
   - Closing `$` at position `end`: must exist after `pos+1`, must NOT be followed by a word character (`\w`), the character before it must NOT be whitespace or backslash, and the content between `pos` and `end` must be non-empty and contain no newline characters.
   - If all checks pass and `silent` is `false`: create a token of type `'katex_inline'` with `content` set to the expression between the two `$` delimiters, push it to `state.tokens`, advance `state.pos` past the closing `$`, and return `true`.
   - If `silent` is `true`: return `true` if the pattern would match, `false` otherwise.

3. Register a renderer rule `md.renderer.rules.katex_inline` that renders the token as `<span class="katex-inline" data-expr="<escapeAttr(expr)>"><escapeHtml(expr)></span>`, using the existing `escapeAttr` and `escapeHtml` helper functions already defined in the same file.

4. Call `this.md.use(katexInlinePlugin)` in the `MarkdownCompiler` constructor, after the `markdownItAnchor` plugin registration.

5. Do NOT yet remove `wrapKatexInline`, `wrapMermaidBlocks`, `KATEX_INLINE`, `MERMAID_RE`, or their calls in `compile()`. Those removals happen in task-3.

### task-2: Implement KaTeX display plugin

- **Title:** Add markdown-it custom plugin for KaTeX display math (`$$...$$`)
- **Depends on:** (none)
- **Context files:**
  - `src/plugins/vite-plugin-easydoc.ts`
  - `specs/fix-katex-mermaid/spec.md`
  - `specs/fix-katex-mermaid/requirements.md`
- **Output files:**
  - `src/plugins/vite-plugin-easydoc.ts` (modified)

**Description:**

Define and register a markdown-it plugin function `katexDisplayPlugin` inside `src/plugins/vite-plugin-easydoc.ts`. The plugin must:

1. Register a custom inline rule named `'katex_display'` via `md.inline.ruler.push(...)`, inserted **before** `'katex_inline'` so that `$$` is tried before `$`. This rule scans `text` tokens for `$$...$$` delimiters.

2. The inline rule's boundary logic:
   - Opening `$$` at position `pos`: `src[pos] === '$'` AND `src[pos+1] === '$'`, must NOT be preceded by a word character or backslash, and `src[pos+2]` (if it exists) must NOT be whitespace.
   - Closing `$$` at position `end`: `src[end] === '$'` AND `src[end+1] === '$'`, must NOT be followed by a word character, and `src[end-1]` must NOT be whitespace or backslash.
   - Content between `pos+2` and `end` must be non-empty (whitespace-only is considered empty — reject).
   - Unlike inline math, display math content MAY contain newlines.
   - If `silent` is `false`: create a token of type `'katex_display'` with `content` set to the expression, push to `state.tokens`, advance `state.pos` past the closing `$$`, return `true`.

3. Register a renderer rule `md.renderer.rules.katex_display` that renders the token as `<span class="katex-display" data-expr="<escapeAttr(expr)>"><escapeHtml(expr)></span>`.

4. Call `this.md.use(katexDisplayPlugin)` in the `MarkdownCompiler` constructor, before `this.md.use(katexInlinePlugin)`.

5. Do NOT yet remove old code. Cleanup happens in task-3.

### task-3: Add Mermaid fence guard and remove old regex code

- **Title:** Guard Mermaid fences from shiki, remove deprecated `wrapKatexInline`/`wrapMermaidBlocks`
- **Depends on:** task-1, task-2
- **Context files:**
  - `src/plugins/vite-plugin-easydoc.ts`
  - `specs/fix-katex-mermaid/spec.md`
  - `specs/fix-katex-mermaid/requirements.md`
- **Output files:**
  - `src/plugins/vite-plugin-easydoc.ts` (modified)

**Description:**

Modify `src/plugins/vite-plugin-easydoc.ts` to complete the migration:

1. **Modify the fence renderer** in `initialize()`: Inside the overridden `md.renderer.rules.fence` function, at the very top (before the shiki highlighter logic), add a guard clause that checks if `lang === 'mermaid'`. If true, return `<pre class="mermaid">` + `escapeHtml(code.trim())` + `</pre>` immediately. This prevents Mermaid code blocks from being passed to shiki. The `escapeHtml` function already exists in the file. The rest of the fence logic (shiki, fallback) remains unchanged.

2. **Remove the `KATEX_INLINE` constant** (the `/\$([^$]+)\$/g` regex at the top of the file).

3. **Remove the `MERMAID_RE` constant** (the `` /```mermaid\s*\n([\s\S]*?)```/g `` regex).

4. **Remove the `wrapKatexInline()` function** entirely (the function definition and its body).

5. **Remove the `wrapMermaidBlocks()` function** entirely (the function definition and its body).

6. **Remove the post-render calls** in `compile()`:
   - Delete the line `html = wrapKatexInline(html);`
   - Delete the line `html = wrapMermaidBlocks(html);`
   
   The `compile()` method should become:
   ```typescript
   compile(raw: string): { html: string; frontmatter: DocFrontmatter; headings: TocHeading[] } {
       const parsed = matter(raw);
       const frontmatter: DocFrontmatter = { title: parsed.data.title || '', ...parsed.data };
       const html = this.md.render(parsed.content);
       const headings = extractHeadings(html);
       return { html, frontmatter, headings };
   }
   ```

7. **Ensure TypeScript compilation passes** — all removed symbols must not be referenced anywhere else in the file. Verify that `escapeAttr` and `escapeHtml` remain (they are still used by the plugin renderers).

---

## Acceptance Criteria

1. **KaTeX inline `$E=mc^2$`** is rendered as `<span class="katex-inline" data-expr="E=mc^2">E=mc^2</span>`.
2. **Shell variable `$uri`** is rendered as plain text, NOT wrapped in `.katex-inline`.
3. **Currency `$100.00`** is rendered as plain text (closing `$` followed by digit).
4. **Inline code `` `$HOME` ``** is rendered as `<code>$HOME</code>`, NOT wrapped.
5. **Code fence content with `$`** (e.g., `echo $PATH` in a bash block) is untouched.
6. **Display math `$$\sum x$$`** is rendered as `<span class="katex-display" data-expr="\sum x">\sum x</span>`.
7. **` ```mermaid ...``` `** is rendered as `<pre class="mermaid">...</pre>`, NOT passed to shiki.
8. **` ```typescript ...``` `** is still rendered by shiki (no regression).
9. **No calls to `wrapKatexInline()` or `wrapMermaidBlocks()`** remain in the codebase.
10. **TypeScript compilation (`tsc --noEmit`)** succeeds with strict mode.
11. **`DocContent.tsx`** continues to work without any changes — KaTeX and Mermaid render correctly client-side.