# Spec: ZH Markdown Features — NEW FILE `docs/zh/guides/markdown-syntax.md`

## Current State
- This file does NOT exist in the ZH docs. The EN version has `docs/en/guides/markdown-syntax.md` but ZH has no equivalent.
- This is a parity gap: ZH users cannot see the Markdown feature showcase.

## What to Create
A Chinese-language equivalent of `docs/en/guides/markdown-syntax.md`.

## Content
- Frontmatter: `title: Markdown 功能展示`, `description: 浏览 EasyDoc 支持的所有 Markdown 功能`, `order: 30`
- Translate the EN file section by section:
  1. 文本格式 (Text Formatting)
  2. 标题 (Headings)
  3. 代码块 (Code Blocks) — with real syntax highlighting examples
  4. 表格 (Tables)
  5. 列表 (Lists)
  6. 引用 (Blockquotes)
  7. 提示框 (Callouts) — described as emoji + blockquote patterns
  8. 分隔线 (Horizontal Rules)
  9. 数学公式 (Mathematical Notation) — KaTeX
  10. 脚注 (Footnotes)
  11. Mermaid 图表 (Mermaid Diagrams)
  12. Markdown 中的 HTML (HTML in Markdown)
  13. 组合功能 (Combining Features)

## Key Points
- Keep code examples as-is (they are language-agnostic)
- Translate only the explanatory text and labels
- Update internal links to use `/zh/` paths
- Use the same corrected frontmatter (no fictional fields)
- Link to `/zh/guide/installation` and `/zh/api/config` in the footer