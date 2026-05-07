# Spec: ZH Installation — `docs/zh/guide/installation.md`

## Current State (Problems)
- Mirrors EN installation but with Chinese translation
- Same fictional npm package references
- Same fictional env vars, TypeScript types, import paths

## Required Changes

### REMOVE (same as EN)
1. "安装包" section (`pnpm add easydoc`)
2. "同级依赖" section
3. "环境变量" section
4. "TypeScript 配置" section

### REPLACE WITH: "安装方式"
Same two methods as EN, translated to Chinese.

### REPLACE WITH: "Vite 插件配置"
Same real vite.config.ts example as EN.

### REPLACE WITH: "插件选项参考"
Same `EasyDocPluginOptions` table, translated.

### REPLACE WITH: "依赖项"
Same dependency table, translated.

### REPLACE WITH: "目录结构"
Show the real directory structure (translated labels).

### REPLACE WITH: "Frontmatter 参考"
Show only real fields: `title` (必填), `description` (可选), `order` (可选), `sidebar` (可选), `toc` (可选).

### KEEP (translated)
- 命名规范
- 验证安装
- 故障排查