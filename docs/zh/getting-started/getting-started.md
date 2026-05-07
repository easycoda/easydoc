---
title: 快速入门
description: 在 5 分钟内学会设置 EasyDoc 并创建您的第一个文档站点。
order: 10
---

# 快速入门

本指南将引导您设置 EasyDoc 并创建第一个文档站点。完成后，您将拥有一个功能完备的本地多语言文档站点。

## 准备工作

开始之前，请确保已安装以下工具：

- **Node.js** 18.x 或更高版本
- **pnpm** 8.x 或更高版本（推荐），或者使用 npm / yarn
- 代码编辑器（推荐 VS Code）

## 克隆项目

EasyDoc 是一个自文档化的项目 —— 您现在阅读的文档正是由 EasyDoc 自身编译和提供的。最快的入门方式是克隆仓库：

```bash
git clone https://github.com/easycoda/easydoc.git easydoc
cd easydoc
pnpm install
```

这将为您提供一个完整可用的 EasyDoc 环境，包括 Vite 插件、SSG 流水线以及所有文档页面。


## 启动开发服务器

运行开发服务器，在本地预览您的站点：

```bash
pnpm dev
```

在浏览器中打开 [http://localhost:8080](http://localhost:8080)。您应该会看到默认的首页。

开发服务器支持 Markdown 文件的 **热模块替换（HMR）** —— 您对 `.md` 文件所做的任何更改都会即时反映在浏览器中。同时，开发服务器还通过 `/api/doc/:lang/*` 端点提供文档数据，供前端在开发过程中获取。

## 编写您的第一份文档

打开 `docs/zh/index.md` 并自定义内容。文件使用 **YAML frontmatter** 来定义元数据：

```yaml
---
title: 我的文档
description: 我的项目的完整指南。
order: 0
---
```

在 frontmatter 下方，编写标准 Markdown：

```markdown
# 我的文档

欢迎来到 **我的项目** 的官方文档。

## 快速开始

安装项目，请运行：

```bash
pnpm install my-project
```
```

## 添加新页面

在 `docs/zh/guide/introduction.md` 创建一个新文件：

```markdown
---
title: 介绍
description: 项目概述及其核心概念。
order: 20
---

# 介绍

本节涵盖项目的基本概念和架构。

## 架构概述

该项目遵循 **模块化架构**，具有清晰的关注点分离。

### 核心模块

| 模块      | 描述            |
|-----------|-----------------|
| `core`    | 核心业务逻辑    |
| `runtime` | 运行时环境      |
| `plugins` | 插件系统        |
| `utils`   | 共享工具函数    |
```

新页面将自动出现在侧边栏导航中，按其 `order` 值排序。

## 添加代码示例

您可以在任何受支持的语言中包含语法高亮的代码块：

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

function getUserDisplayName(user: User): string {
  return `${user.name} <${user.email}>`;
}
```

```python
def fibonacci(n: int) -> list[int]:
    """返回前 n 个斐波那契数。"""
    seq = [0, 1]
    for _ in range(n - 2):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

print(fibonacci(10))
```

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  animation: fade-in 0.6s ease-out;
}
```

## 构建生产版本

准备部署时，构建静态站点：

```bash
pnpm build
```

输出位于 `dist/` 目录中。构建产物为每个文档页面生成完全预渲染的 HTML —— 每个页面在 `<div id="root">` 中包含服务端渲染的内容，React 在加载时通过 `hydrateRoot` 进行水合。这使得站点对 SEO 友好，且首屏渲染极快。生成的静态文件可部署到任何 CDN 或静态文件托管服务（Netlify、Vercel、GitHub Pages、S3 + CloudFront 等）。

## 下一步

- 了解如何在现有项目中 [安装和配置](/zh/guide/installation) EasyDoc。
- 浏览完整的 [配置选项](/zh/api/config)。
- 深入了解 [Markdown 语法指南](/zh/guides/markdown-syntax)，查看所有支持的功能。