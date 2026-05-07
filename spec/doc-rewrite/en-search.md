# Spec: EN Search — `docs/en/guides/search.md`

## Current State (Problems)
- Generally accurate but references `documents/` directory for the search index source (should be `docs/`)
- The search behavior description is accurate (fuse.js, fuzzy, grouped results)

## Required Changes

### MINIMAL changes — this file is ~95% accurate

### MODIFY: "Search Index" Section
- Change `documents/` → `docs/` (or `docsRoot` directory configured in the plugin)
- Add: "The search index is generated at build time and emitted as `dist/search-index.json`. It is also available at `/search-index.json` during development."

### MODIFY: "Tips" Section
- Verify: Does EasyDoc actually support quoted exact match search? Check fuse.js configuration. If not, remove that tip.
- The case-insensitive, real-time, multi-language tips are accurate.
- Add tip: "Search indexes all pages across all configured locales. Results from the current locale appear first."

### ADD: "Technical Details" (optional)
- Powered by fuse.js v7
- Index built from document titles, headings, and body text (with Markdown syntax stripped)
- Available offline after first load (the index JSON is fetched once and cached)