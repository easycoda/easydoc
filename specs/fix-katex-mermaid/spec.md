# Technical Design: Fix KaTeX/Mermaid Regex Matching

## Overview

Move KaTeX and Mermaid detection from post-render regex to **markdown-it custom plugins** that operate at the tokenizer level, where context (code blocks, inline code, etc.) is inherently known.

## Architecture Decision

We implement **two custom markdown-it plugins** and **one fence rule modification**, all inside `src/plugins/vite-plugin-easydoc.ts`. No new files are created. The plugins are added to the `MarkdownCompiler` constructor via `this.md.use(...)`.

### Why inline plugins (not separate files)?

- The logic is tightly coupled to the compiler class (needs `this.md`, `this.highlighter`)
- Each plugin is ~30–50 lines; extracting to separate files would create unnecessary indirection
- The entire compiler is already self-contained in one file

---

## Design: KaTeX Inline Plugin (`md.use(katexInlinePlugin)`)

### Algorithm (pseudocode)

```
function katexInlinePlugin(md):
    // Rule 1: Inline rule — scans text tokens for $...$ patterns
    md.inline.ruler.push('katex_inline', function(state, silent):
        // Only scan text tokens (skip code_inline, html_inline, etc.)
        
        // Find opening $:
        //   - Position must not be preceded by word char (\w)
        //   - Position must not be followed by whitespace
        //   - The $ must not be escaped (\$)
        //   - Not inside a code block (handled by tokenizer implicitly)
        
        // Find closing $:
        //   - Scan forward from opening position + 1
        //   - Must find a non-escaped $
        //   - That $ must not be followed by a word char
        //   - That $ must not be preceded by whitespace
        //   - Content between must be non-empty and not contain newlines
        
        // If silent mode: return true (indicates rule would match)
        // If not silent:
        //   - Create 'katex_inline' token with content=expression
        //   - Push to state.tokens
        //   - Advance state.pos past closing $
        //   - Return true
    )
    
    // Rule 2: Renderer — converts katex_inline token to HTML
    md.renderer.rules.katex_inline = function(tokens, idx):
        expr = tokens[idx].content.trim()
        return '<span class="katex-inline" data-expr="' + escapeAttr(expr) + '">' + escapeHtml(expr) + '</span>'
```

### Key boundary regex (used inside the inline rule)

```
Opening check at position `pos` in string `src`:
  - src[pos] === '$'
  - pos === 0 OR src[pos-1] is NOT \w AND src[pos-1] is NOT '\'
  - pos+1 < src.length AND src[pos+1] is NOT whitespace

Closing check at position `end`:
  - src[end] === '$'
  - end+1 >= src.length OR src[end+1] is NOT \w
  - end-1 >= pos+1 AND src[end-1] is NOT whitespace
  - src[end-1] is NOT '\'
```

### Why not a single regex?

A regex like `/(?<!\w)\$(?=[^\s])(.+?)(?<=[^\s])\$(?!\w)/g` could theoretically work but:
1. JavaScript lacks full lookbehind in all environments
2. Cannot skip inline code (`text` tokens are already separated from `` `code` `` tokens by markdown-it's inline parser)
3. The tokenizer gives us structured tokens — we scan only `text` tokens

---

## Design: KaTeX Display Plugin (`md.use(katexDisplayPlugin)`)

### Algorithm (pseudocode)

```
function katexDisplayPlugin(md):
    // Block rule — intercepts paragraphs that contain $$...$$
    md.block.ruler.before('paragraph', 'katex_display', function(state, startLine, endLine, silent):
        // Check if current line starts with $$ (after optional whitespace)
        line = state.getLine(startLine).trim()
        if not line.startsWith('$$'): return false
        
        // Find closing $$ — may span multiple lines
        // Scan subsequent lines for $$
        
        // If silent: return true
        // If not silent:
        //   - Extract full expression between $$ and $$
        //   - Create 'katex_display' block token
        //   - Return true with consumed line count
    )
    
    md.renderer.rules.katex_display = function(tokens, idx):
        expr = tokens[idx].content.trim()
        return '<span class="katex-display" data-expr="' + escapeAttr(expr) + '">' + escapeHtml(expr) + '</span>'
```

### Alternative (simpler): Inline-level `$$...$$` rule

Instead of a block rule, we can extend the inline rule to also match `$$...$$` delimiters. This is simpler and avoids conflicting with markdown-it's paragraph handling. The inline rule would:

1. Try `$$` first (greedy), then `$`
2. For `$$`: same boundary checks, but content **can** contain newlines
3. Output: `katex_display` token type

**Decision: Use the inline-level approach for `$$` display math.** It's simpler, doesn't fight with block parsing, and correctly handles inline display math like `text $$math$$ text`.

---

## Design: Mermaid Fence Rule

### Current fence renderer

The existing code overrides `md.renderer.rules.fence` to use shiki for syntax highlighting:

```typescript
this.md.renderer.rules.fence = function(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const code = ...;
    const lang = token.info?.trim().split(/\s+/)[0] || 'text';
    // shiki highlighting...
}
```

### Modified fence renderer

Add a **guard clause** at the top: if `lang === 'mermaid'`, short-circuit and return Mermaid HTML:

```typescript
this.md.renderer.rules.fence = function(tokens, idx, options, env, slf) {
    const token = tokens[idx];
    const code = token.content.replace(/\n$/, '');
    const lang = token.info?.trim().split(/\s+/)[0] || 'text';

    // Mermaid guard — skip shiki, output raw mermaid container
    if (lang === 'mermaid') {
        return '<pre class="mermaid">' + escapeHtml(code.trim()) + '</pre>';
    }

    // ... existing shiki logic ...
}
```

This is the most precise approach because markdown-it's fence tokenizer already:
- Correctly identifies fenced code block boundaries (`` ``` ... ``` ``)
- Handles nested backticks, indentation, and info strings
- Never confuses fence content with prose

---

## Files to Modify

### `src/plugins/vite-plugin-easydoc.ts`

| Change | Description |
|--------|-------------|
| **Remove** `KATEX_INLINE` constant | No longer needed |
| **Remove** `MERMAID_RE` constant | No longer needed |
| **Remove** `wrapKatexInline()` function | Replaced by inline plugin |
| **Remove** `wrapMermaidBlocks()` function | Replaced by fence guard |
| **Remove** the two lines in `compile()` that call `wrapKatexInline(html)` and `wrapMermaidBlocks(html)` | Replaced by plugin layer |
| **Add** `katexInlinePlugin` function | Custom markdown-it plugin for `$...$` |
| **Add** `katexDisplayPlugin` function | Custom markdown-it plugin for `$$...$$` |
| **Add** calls to `this.md.use(katexInlinePlugin)` and `this.md.use(katexDisplayPlugin)` in constructor | Register plugins |
| **Modify** fence renderer in `initialize()` | Add Mermaid guard clause before shiki |

### Files NOT modified

| File | Reason |
|------|--------|
| `src/components/DocContent.tsx` | Client-side rendering unchanged — still uses `.mermaid` and `.katex-inline` selectors |
| `src/types/katex.d.ts` | Type declarations unchanged |
| `src/types/doc.ts` | No new types needed |
| `package.json` | No new dependencies |

---

## Test Cases

### Manual verification

After implementation, create a test markdown file with these sections and verify the output HTML:

```markdown
# KaTeX & Mermaid Test

## Should render as KaTeX inline

$E=mc^2$

## Should NOT render as KaTeX

nginx try_files $uri $uri.html

This costs $100.00.

Inline code: `$HOME`

```bash
echo $PATH
```

## Should render as KaTeX display

$$\sum_{i=1}^{n} x_i$$

## Should render as Mermaid

```mermaid
graph TD
    A-->B
```

## Should render as TypeScript (shiki)

```typescript
const x: number = 1;
```
```

### Expected outputs

| Section | Expected HTML |
|---------|---------------|
| `$E=mc^2$` | `<span class="katex-inline" data-expr="E=mc^2">E=mc^2</span>` |
| `$uri` | Plain text `$uri` |
| `$100.00` | Plain text `$100.00` |
| `` `$HOME` `` | `<code>$HOME</code>` (unchanged) |
| `echo $PATH` in code fence | Inside shiki-highlighted code block, `$PATH` untouched |
| `$$\sum...$$` | `<span class="katex-display" data-expr="\sum_{i=1}^{n} x_i">...</span>` |
| ```` ```mermaid ...``` ```` | `<pre class="mermaid">graph TD\n    A-->B</pre>` |
| ```` ```typescript ...``` ```` | Shiki-highlighted div.code-block |