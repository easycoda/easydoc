---
title: Search
description: EasyDoc includes a built-in full-text fuzzy search that indexes all your documentation at build time, giving users instant results with zero server-side dependencies.
order: 50
---

# Search

## Overview

EasyDoc ships with a powerful, built-in full-text search that works entirely on the client side. There is no search server to maintain, no API to configure — the search index is generated at build time and embedded into your static site. Users get instant, fuzzy-matched results across all documentation pages.

## Opening Search

Press **Cmd+K** (macOS) or **Ctrl+K** (Windows/Linux) to open the search dialog from anywhere in the documentation. You can also click the search button in the top navigation bar.

The search dialog provides a clean, keyboard-friendly interface:

- Start typing to see instant results
- Navigate results with the **↑** and **↓** arrow keys
- Press **Enter** to open the selected result
- Press **Esc** or click outside to dismiss the dialog

## How Search Works

### Fuzzy Matching

EasyDoc uses fuzzy search, which means you don't need to type exact words. Partial matches, typos, and approximate queries all work:

- Searching for "instal" will match "Installation"
- Searching for "confg" will match "Configuration"
- Searching for "mrkdown" will match "Markdown"

### Grouped Results

Search results are grouped by document, making it easy to see which page each match comes from. Each result shows:

- The document title
- A relevant snippet with the matching text highlighted
- The section heading where the match was found

## Search Index

The search index is generated at build time by scanning all Markdown files in your `docs/` directory. The Vite plugin extracts:

- Document titles from frontmatter
- All heading text (h1 through h6)
- Body content (plain text, stripped of Markdown formatting)

The index is emitted as `dist/search-index.json`. During development it is also served at `/search-index.json`, and in production the client fetches this file on first use and caches it for the remainder of the session.

You don't need to configure anything — if you add a new Markdown file, it will be indexed automatically on the next build.

## Tips

- **Search is case-insensitive** — `INSTALLATION`, `installation`, and `Installation` all return the same results.
- **Results update in real time** — As you type, the results list updates instantly. No need to press Enter to search.
- **All languages are indexed** — If you have documentation in multiple languages, search works across all of them.
- **Current locale appears first** — Search indexes all pages across all configured locales. Results from the current locale appear first.

## Technical Details

- Powered by **Fuse.js v7**, a lightweight fuzzy-search library.
- The index is built from document titles, headings, and body text (with Markdown syntax stripped).
- The search index JSON is fetched once on first use and cached for the entire session, so search is available offline after the initial page load.