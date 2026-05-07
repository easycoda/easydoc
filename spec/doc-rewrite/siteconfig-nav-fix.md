# Spec: SiteConfig Nav Update — `src/lib/siteConfig.ts`

## Current State (Problems)
The `siteConfig.ts` nav configuration references paths that exist in the current docs (e.g., `/en/guide/getting-started`) but some paths may need updating depending on whether we unify the EN/ZH directory structures.

## Assessment
Looking at the current state:
- EN uses `getting-started/` and `guides/` directories
- ZH uses `guide/` and `api/` directories
- The `siteConfig.ts` nav currently has:
  - `nav.guide` → children with `/en/guide/getting-started` and `/en/guide/installation`
  - `nav.api` → children with `/en/api/config`

These paths currently work because the EN docs are at `docs/en/getting-started/getting-started.md`, etc. However:
- The `nav.guide` links point to `/en/guide/...` but the actual EN files are at `/en/getting-started/...`
- Wait — let me re-examine. The `siteConfig` has `path: '/en/guide/getting-started'` but the actual doc file is at `docs/en/getting-started/getting-started.md`.

This is a BUG in `siteConfig.ts`! The nav links point to paths that don't match the docs directory structure. However, the routing system uses virtual modules and the path resolution depends on how the plugin works.

## Required Changes

### VERIFY the routing behavior first
The plugin's `resolveMdFile` constructs paths from virtual module IDs like `en/guide/getting-started` → `docs/en/guide/getting-started.md`. But the actual file is at `docs/en/getting-started/getting-started.md`.

If we are NOT restructuring directories, then `siteConfig.ts` nav links must match the actual file paths.

### If keeping current EN directory structure (`getting-started/`, `guides/`):

Update nav paths in `siteConfig.ts`:
```typescript
nav: [
  {
    label: 'nav.guide',
    children: [
      { label: 'Getting Started', path: '/en/getting-started/getting-started' },
      { label: 'Installation', path: '/en/getting-started/installation' },
      { label: 'Configuration', path: '/en/getting-started/configuration' },
    ],
  },
  {
    label: 'nav.api',
    children: [
      { label: 'Markdown Features', path: '/en/guides/markdown-syntax' },
      { label: 'Search', path: '/en/guides/search' },
    ],
  },
  // ... rest
],
```

Also update footer links similarly.

### If restructuring EN to use `guide/` and `api/` (matching ZH):
This would involve renaming `docs/en/getting-started/` → `docs/en/guide/` and `docs/en/guides/` → `docs/en/api/`. This is a bigger change but achieves structural consistency.

**Decision: Do NOT restructure directories.** The spec is about documentation content, not file reorganization. The simpler approach is to fix `siteConfig.ts` nav to match actual file locations.

## Required Changes in `src/lib/siteConfig.ts`

### MODIFY: nav.children paths
- `/en/guide/getting-started` → `/en/getting-started/getting-started`
- `/en/guide/installation` → `/en/getting-started/installation`
- `/en/api/config` → `/en/getting-started/configuration`

### MODIFY: footer.links paths
- `/en/guide/getting-started` → `/en/getting-started/getting-started`
- `/en/api/config` → `/en/getting-started/configuration`

### ADD: Markdown Features and Search to nav
Consider adding entries for the guides:
```typescript
{
  label: 'Guides',
  children: [
    { label: 'Markdown Features', path: '/en/guides/markdown-syntax' },
    { label: 'Search', path: '/en/guides/search' },
  ],
},
```