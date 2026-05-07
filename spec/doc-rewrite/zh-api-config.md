# Spec: ZH Configuration API — `docs/zh/api/config.md`

## Current State (Problems)
- This is the most problematic file. It references:
  - `easydoc/plugin` import (FICTIONAL)
  - `SiteConfig` from `'easydoc'` (FICTIONAL — real SiteConfig is in `src/types/config.ts`)
  - `src/config/site.ts` as config location (FICTIONAL — real is `src/lib/siteConfig.ts`)
  - `virtual:easydoc-doc:<path>` virtual modules as user-facing API (INTERNAL — not for users)
  - `virtual:easydoc-manifest:<lang>` (INTERNAL)
  - `virtual:easydoc-search-index` (INTERNAL)
  - `createCompiler`, `createManifestBuilder` from `'easydoc'` (FICTIONAL)
  - CSS custom properties (`--color-primary`, `--code-bg`, etc.) as documented public API (NOT a real documented API)
  - Custom containers (`::: tip`, `::: warning`, `::: danger`) — NOT implemented
  - Fictional build output structure
  - `outDir` option described differently from reality

## Required Changes

### COMPLETE REWRITE
This file needs to be rewritten from scratch. It should parallel the corrected EN `configuration.md` but in Chinese.

### REPLACE ENTIRE CONTENT WITH:

**标题:** 配置参考

**概述:** EasyDoc 有两个配置层：Vite 插件选项和站点配置。

**1. Vite 插件选项**
- Real `EasyDocPluginOptions` interface
- Real config example with local import
- Table of options (`docsRoot`, `locales`, `defaultLocale`, `outDir`)

**2. 站点配置 (SiteConfig)**
- Location: `src/lib/siteConfig.ts`
- Full `SiteConfig` reference table
- `NavLink` reference
- `FooterConfig` / `SocialLink` reference
- Real example from `siteConfig.ts`

**3. 国际化配置**
- Translation files: `src/i18n/en.ts`, `src/i18n/zh.ts`
- `UITranslations` interface
- How to add a new language
- `useTranslation()` hook

**4. Frontmatter 参考**
- Only real fields: `title`, `description`, `order`, `sidebar`, `toc`

**5. 构建输出结构**
- Real `dist/` structure

### REMOVE (not replaced)
- Virtual modules section (internal implementation detail)
- CSS custom properties section (not a public API)
- Custom containers section (not implemented)
- Programming API section (fictional `createCompiler`, `createManifestBuilder`)
- Old plugin options with fictional fields

### KEEP (translated and verified)
- `easyDocPlugin` function description (but correct the import path and options)
- Build output description (but correct the structure)
- Mermaid/KaTeX examples (verify they work and keep them)