# Spec: EN Markdown Features — `docs/en/guides/markdown-syntax.md`

## Current State (Problems)
- The file is mostly a feature showcase and is largely accurate
- References `/docs/guide/getting-started` for internal links (wrong path)
- References `/docs/guide/configuration` (wrong path)
- References `/docs/advanced/deployment` (doesn't exist)
- References `sidebar_label` and `tags` frontmatter fields that don't exist in real code
- The "Callouts / Admonitions" section uses custom HTML patterns that work but don't describe an actual callout system

## Required Changes

### MINIMAL changes — this file is ~90% accurate as a feature showcase

### MODIFY: Internal Links
- `/docs/guide/getting-started` → `/en/getting-started/getting-started`
- `/docs/guide/configuration` → `/en/getting-started/configuration`
- `/docs/advanced/deployment` → remove or link to build section in configuration

### MODIFY: Frontmatter Example
In the "Combining Features" section, remove fictional fields:
```yaml
---
title: 'API Reference'
description: 'Complete API documentation'
order: 30
---
```
(Remove `sidebar_label` and `tags`)

### MODIFY: "Callouts / Admonitions" Section
Either:
- Remove this section (since there's no dedicated callout plugin), OR
- Rephrase as "You can use blockquotes with emoji for note/warning callouts" (which is what it's actually showing)

### VERIFY (no changes needed if working):
- Syntax highlighting (shiki with dual themes)
- Emoji support (markdown-it-emoji)
- KaTeX math (markdown-it-texmath)
- Mermaid diagrams (lazy-loaded)
- Tables, lists, blockquotes, footnotes
- HTML in Markdown
- Line highlighting and diff view in code blocks

### MODIFY: Footer "Next Steps" Links
Update all links to real paths.

### UPDATE: Heading
Add a note at the top: "This page showcases all Markdown features supported by EasyDoc's markdown-it pipeline. For configuration options, see [Configuration](/en/getting-started/configuration)."