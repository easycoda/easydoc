# Documentation Rewrite — Overview

## What Is Being Built
A complete rewrite of all English (`docs/en/`) and Chinese (`docs/zh/`) documentation files to accurately reflect the real EasyDoc project. The current docs describe a fictional npm package with fictional APIs. They must be replaced with truthful documentation showing EasyDoc as a self-contained Vite monorepo where users git-clone the project and the SSG plugin lives as a local source file.

## Primary User Value
Users who land on the EasyDoc documentation site will be able to understand what EasyDoc actually is, how to install and configure it, what features it supports, and how to use it — without being misled by fictional npm package references or non-existent APIs.

## Scope
- Rewrite 6 English Markdown files (`docs/en/`)
- Rewrite 4 Chinese Markdown files (`docs/zh/`)
- Align EN/ZH directory structures (resolve `getting-started/` vs `guide/` inconsistency)
- Add missing ZH files (markdown features showcase, search guide)
- Remove all references to fictional npm packages, APIs, virtual modules, env vars, and CSS custom properties
- Update `src/lib/siteConfig.ts` nav links if directory structure changes

## Out of Scope
- Modifying the Vite plugin code (`src/plugins/vite-plugin-easydoc.ts`)
- Modifying React components or pages
- Changing the build system or vite.config.ts
- Adding new actual features

## Success Criteria
1. No doc file references `easydoc` as an npm package
2. No doc file references `createEasyDoc`, `createCompiler`, `createManifestBuilder`, or other fictional functions
3. No doc file references `easydoc/plugin`, `easydoc/client`, `easycoda-vite/plugin`, or other fictional import paths
4. No doc file references environment variables (`EASYDOC_*`)
5. No doc file references `virtual:easydoc-*` virtual modules (these are internal, not user-facing APIs)
6. Installation instructions show `git clone` + `pnpm install` flow
7. Configuration instructions show real `vite.config.ts` with local `vitePluginEasyDoc` import
8. Frontmatter reference only shows actually supported fields: `title`, `description`, `order`, `sidebar`, `toc`
9. All features described are actually implemented and working
10. EN and ZH directories have matching structure and content parity