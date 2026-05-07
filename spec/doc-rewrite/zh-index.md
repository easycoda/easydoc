# Spec: ZH Home Page — `docs/zh/index.md`

## Current State (Problems)
- Mirrors EN index with Chinese translation but has the same fictional content:
- Fictional `createEasyDoc` from `'easydoc'` in quick example
- Fictional project structure (symmetrical en/zh)
- Links to `/zh/guide/getting-started` and `/zh/guide/installation` (correct relative to ZH structure)
- Links to `/zh/api/config` (correct relative to ZH structure)

## Required Changes

### REMOVE
1. The "快速示例" section with `createEasyDoc` from `'easydoc'`
2. The fictional project structure

### REPLACE WITH: "什么是 EasyDoc？"
Rewrite to match corrected EN version:
- "EasyDoc 是一个自包含的 Vite + React 文档框架。您当前浏览的文档站点就是由它自身的构建插件编译而成的。"
- Position as clone-to-use, not npm install

### REPLACE WITH: "快速开始"
```bash
git clone <repo-url> my-docs
cd my-docs
pnpm install
pnpm dev
```

### REPLACE WITH: "真实项目结构"
Show the same real directory structure as the EN version (reflecting the actual current layout with `getting-started/` and `guides/` in EN, and `guide/` and `api/` in ZH).

### UPDATE: "核心特性"
Verify translation matches real features:
- SSG + SPA: 构建时预渲染，运行时 hydrateRoot 水合
- Shiki 语法高亮（双主题）
- KaTeX 数学渲染
- Mermaid 图表（懒加载）
- fuse.js 全文搜索
- 暗色模式（系统检测 + 手动切换）
- 响应式布局
- SEO 元标签

### UPDATE: "下一步" Links
- 快速入门 → `/zh/guide/getting-started`
- 安装配置 → `/zh/guide/installation`
- 配置 API → `/zh/api/config`