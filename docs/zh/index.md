---
title: EasyDoc 文档
description: EasyDoc 是一个自包含的 Vite + React SSG 文档框架。浏览这些文档了解它的工作原理和使用方式。
order: 0
---

# EasyDoc 文档

欢迎来到 EasyDoc！本指南将帮助您了解这个框架，并快速上手搭建自己的文档站点。

## 什么是 EasyDoc？

EasyDoc 是一个**自包含的 Vite + React 文档框架**——您当前正在浏览的就是它。这份文档正是由它自身的 SSG 编译插件生成的，是框架能力最直接的证明。

克隆此仓库即可作为您文档站点的起点，也可以将插件复制到现有的 Vite 项目中使用。它**不是**通过 npm 安装的包——而是一个完整的项目，您可以直接克隆、定制并打造属于自己的文档站点。

在核心层面，EasyDoc 将 Markdown 文件编译为多语言、SEO 友好的静态站点，并提供类似应用的阅读体验。您可以将其视为基于 Vite 和 React 构建的 VitePress/Docusaurus 轻量级替代方案。

EasyDoc 完全由 EasyCoda React AI 智能体团队完成，作者只是修改了一些 CSS 的对齐配置。

## 快速开始

```bash
git clone https://github.com/easycoda/easydoc.git easydoc
cd easydoc
pnpm install
pnpm dev
```

您的文档存放在 `docs/` 目录中。打开 `http://localhost:8080` 即可开始编写 Markdown。

## 项目结构

```text
easydoc/
├── docs/
│   ├── en/
│   │   ├── index.md
│   │   ├── getting-started/
│   │   │   ├── getting-started.md
│   │   │   └── configuration.md
│   │   └── guides/
│   │       ├── theme.md
│   │       ├── markdown-syntax.md
│   │       └── search.md
│   └── zh/
│       ├── index.md
│       ├── guide/
│       │   ├── getting-started.md
│       │   └── installation.md
│       └── api/
│           └── config.md
├── src/
│   ├── plugins/
│   │   └── vite-plugin-easydoc.ts   # The SSG 插件
│   ├── components/
│   ├── pages/
│   ├── i18n/
│   ├── types/
│   ├── services/
│   ├── ssr/    # 编译时服务端渲染插件
├── spec        # 架构师智能体写的项目开发规范
├── specs       # 架构师智能体写的项目开发规范
├── vite.config.ts
└── package.json
```

## 核心特性

- **📝 Markdown 优先** — 使用标准 Markdown 编写文档，配合 YAML frontmatter 元数据，由 markdown-it 编译。
- **🌐 多语言支持** — 内置国际化方案，使用语言前缀路由（`/en/`、`/zh/`），翻译文本位于 `src/i18n/`。
- **⚡ SSG + SPA** — 构建时预渲染保障 SEO，运行时通过 `hydrateRoot` 实现即时交互，后续导航采用客户端渲染。
- **🔍 全文搜索** — 基于 fuse.js 的客户端搜索，构建时生成索引，按 Cmd+K / Ctrl+K 即可打开。
- **🎨 语法高亮** — Shiki 双主题切换（vitesse-light / vitesse-dark），支持行高亮和 diff 视图。
- **📊 图表与公式** — Mermaid 图表（懒加载优化性能）和 KaTeX 数学公式，通过 markdown-it-texmath 渲染。
- **🌗 暗色模式** — 自动检测系统偏好，支持手动切换，通过 next-themes 解决 SSR 兼容。
- **📱 响应式布局** — 基于 shadcn sidebar，移动端可折叠，配合顶部导航菜单。
- **🔎 SEO 优化** — 每页独立 meta 标签，包含 title、description、og:* 和 canonical URL。

## 下一步

- 前往 [快速入门](/zh/getting-started/getting-started) 了解 EasyDoc 的工作原理。
- 查看 [安装配置](/zh/getting-started/configuration) 页面，了解详细的设置说明。
- 探索 [Markdown 语法](/zh/guides/markdown-syntax) 支持的完整功能。
- 了解 [全文搜索](/zh/guides/search) 的使用方式。