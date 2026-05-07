# Requirements: Fix KaTeX/Mermaid Regex Matching

## Current Problem

The `MarkdownCompiler.compile()` method in `src/plugins/vite-plugin-easydoc.ts` uses two fragile regular expressions applied to the **already-rendered HTML** output from markdown-it:

```typescript
const KATEX_INLINE = /\$([^$]+)\$/g;
const MERMAID_RE = /```mermaid\s*\n([\s\S]*?)```/g;
```

These are applied in `wrapKatexInline()` and `wrapMermaidBlocks()` after `this.md.render()`.

### Known failure scenarios

| # | Input | Current behavior | Expected behavior |
|---|-------|-----------------|-------------------|
| 1 | `nginx try_files $uri $uri.html` | Wraps each `$...` as KaTeX inline math | Leave as plain text |
| 2 | `` `$HOME` `` in inline code | `$HOME` matched and wrapped | Leave as code (backtick-delimited code should be ignored) |
| 3 | `$100.00` (currency) | Matched as KaTeX delimiter | Leave as plain text |
| 4 | `Some text $E=mc^2$ with trailing` | May match correctly but fragile | Correctly identify `$E=mc^2$` as KaTeX inline |
| 5 | Fenced code block containing `$` | `$` inside code block matched | Leave code block contents untouched |
| 6 | HTML attribute `data-value="$abc"` | `$abc` matched | Leave attribute content untouched |
| 7 | `` ```mermaid `` code block with complex content | Regex `[\s\S]*?` may mis-match on nested backticks | Precisely identified via fence tokenizer |
| 8 | `$$a + b$$` — block-level KaTeX | Not handled at all (only `KATEX_INLINE` matches `$...$`, but `$$` creates overlapping match issues) | Recognized as display math |

### Root cause

Post-rendering regex operates on **flat HTML strings** with zero context awareness. It cannot distinguish between:
- Actual KaTeX delimiters vs. incidental `$` characters in text
- Code block content vs. prose
- Inline code vs. surrounding text
- HTML attributes vs. text content

## Expected Behavior After Fix

### KaTeX inline (`$...$`)

1. A pair of `$` delimiters **must** have:
   - The opening `$` **not** immediately preceded by a word character (`\w`)
   - The closing `$` **not** immediately followed by a word character (`\w`)
   - At least one character between them
   - The opening `$` must not be immediately followed by whitespace
   - The closing `$` must not be immediately preceded by whitespace

2. `$` delimiters inside:
   - Fenced code blocks (` ```...``` `)
   - Inline code (`` `...` ``)
   - HTML attributes
   …are **never** treated as KaTeX delimiters.

3. Output: `<span class="katex-inline" data-expr="<escaped expression>"><escaped expression></span>`

### KaTeX display (`$$...$$`)

Same boundary rules as inline. Output: `<span class="katex-display" data-expr="<escaped expression>"><escaped expression></span>`.

### Mermaid diagrams

Identified by markdown-it's existing **fence tokenizer**. A fenced code block with `info === 'mermaid'` is NOT passed to shiki; instead it outputs `<pre class="mermaid"><escaped mermaid code></pre>`.

### Client side (no changes)

`DocContent.tsx` continues to:
- Call `renderMathInElement()` which finds `.katex-inline`/`.katex-display` elements via `data-expr` and renders KaTeX
- Call `mermaid.run()` which finds `.mermaid` elements via querySelector

## Boundary Conditions

### KaTeX inline

| Condition | Input | Should match? |
|-----------|-------|---------------|
| Standard math | `$E=mc^2$` | ✅ Yes |
| Dollar amount | `$100.00` | ❌ No (closing `$` has word char after? Actually `0` is a digit = word char) |
| Shell variable with braces | `${HOME}` | ❌ No (`{` is not a word char, but `$` before `{` — depends on rule: `$` followed by `{` is ambiguous; safe to skip) |
| Shell variable plain | `$uri` | ❌ No (word char immediately after `$`) |
| `$` in inline code | `` `$HOME` `` | ❌ No (inside inline code) |
| `$` in code block | ```` ```bash\n$ echo hi\n``` ```` | ❌ No (inside fence) |
| Math touching punctuation | `equation $x+y$. Then` | ✅ Yes — `$` after space, `.` after `$` is not word char |
| Math with newline inside | `$a\nb$` | ❌ No (newline inside inline math) |
| Escaped dollar | `\$100` | ❌ No (`\$` is escaped) |
| Single unpaired `$` | `costs $5` | ❌ No (unpaired) |
| Nested dollars | `$a $b$ c$` | The outer `$a ... c$` should match; inner `$b$` should NOT be separately matched (greedy match) |
| Empty math | `$$` | ❌ No |
| Whitespace-only math | `$ $` | ❌ No |
| Math at start of line | `$x$ = 1` | ✅ Yes |
| Math at end of line | `value = $x$` | ✅ Yes |

### KaTeX display

| Condition | Input | Should match? |
|-----------|-------|---------------|
| Standard display | `$$\sum_{i=1}^n$$` | ✅ Yes |
| Display with newlines | `$$\na + b\n$$` | ✅ Yes |
| Empty display | `$$$$` | ❌ No |
| Display touching text | `text$$math$$text` | ✅ Yes (boundary check on `$` pairs) |

### Mermaid

| Condition | Input | Should match? |
|-----------|-------|---------------|
| Standard mermaid | ```` ```mermaid\ngraph TD\nA-->B\n``` ```` | ✅ Yes |
| Mermaid with extra info | ```` ```mermaid {.class}\n...\n``` ```` | ✅ Yes (first word of info is `mermaid`) |
| Non-mermaid fence | ```` ```typescript\nconst x = 1;\n``` ```` | ❌ No (pass to shiki) |
| Indented mermaid | ```` ```mermaid\n  graph TD\n``` ```` | ✅ Yes |