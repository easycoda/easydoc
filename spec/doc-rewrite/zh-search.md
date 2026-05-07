# Spec: ZH Search — NEW FILE `docs/zh/guides/search.md`

## Current State
- This file does NOT exist in the ZH docs. The EN version has `docs/en/guides/search.md` but ZH has no equivalent.
- This is a parity gap: ZH users cannot read about the search feature in Chinese.

## What to Create
A Chinese-language equivalent of `docs/en/guides/search.md`.

## Content
- Frontmatter: `title: 搜索`, `description: EasyDoc 内置全文模糊搜索`, `order: 40`
- Translate the EN file:
  1. 概述 (Overview)
  2. 打开搜索 (Opening Search) — Cmd+K / Ctrl+K
  3. 搜索原理 (How Search Works) — fuse.js, fuzzy matching
  4. 搜索结果分组 (Grouped Results)
  5. 搜索索引 (Search Index) — build-time generation
  6. 使用技巧 (Tips)

## Key Points
- Keep technical terms (fuse.js, Cmd+K, etc.) in English
- Translate explanatory text
- Correct the `documents/` → `docs/` directory reference
- Verify and translate the tips (case-insensitive, real-time updates, multi-language)