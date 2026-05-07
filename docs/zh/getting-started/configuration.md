---
title: 配置指南
description: EasyDoc 完整配置参考 —— 插件选项、站点配置、国际化与构建输出。
order: 20
---
# 配置指南

## 配置概述

EasyDoc 有两个配置层，分别控制文档站点的不同方面：

1. **`vite.config.ts` 中的插件选项** —— 控制构建行为：文档存放位置、要构建的语言环境以及输出目录。
2. **`src/lib/siteConfig.ts` 中的站点配置** —— 控制渲染后的站点：标题、导航、页脚、社交链接和 SEO 元数据。

这两层相互独立。插件读取 Markdown 文件并生成预渲染的 HTML；站点配置则定义围绕内容的页面框架（页眉、页脚、语言切换器）。

---

## Vite 插件配置

EasyDoc 作为 Vite 插件内置于您的项目中。请将其添加到 `vite.config.ts`：

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vitePluginEasyDoc } from "./src/plugins/vite-plugin-easydoc";
import type { EasyDocPluginOptions } from "./src/types/vite-plugin";

const easyDocOptions: EasyDocPluginOptions = {
  docsRoot: "docs/",
  locales: ["en", "zh"],
  defaultLocale: "en",
  // outDir: "docs-dist",  // 可选：自定义输出目录
};

export default defineConfig({
  plugins: [react(), vitePluginEasyDoc(easyDocOptions)],
});
```

### 插件选项参考

| 选项 | 类型 | 必填 | 默认值 | 描述 |
|---|---|---|---|---|
| `docsRoot` | `string` | 是 | — | 包含各语言子目录的根目录（例如 `docs/en/`、`docs/zh/`）。 |
| `locales` | `string[]` | 是 | — | 支持的语言代码，必须与 `docsRoot` 内的子目录名称一致。 |
| `defaultLocale` | `string` | 是 | — | 默认语言，用于首页重定向及回退处理。 |
| `outDir` | `string` | 否 | `dist` | 构建后文档站点的自定义输出目录。 |

---

## 站点配置

站点配置位于 `src/lib/siteConfig.ts`，使用 `src/types/config.ts` 中的 `SiteConfig` 类型。这是站点标题、导航、页脚和 SEO 详情的唯一数据来源。

```typescript
// src/lib/siteConfig.ts
import type { SiteConfig } from "../types/config";

export const siteConfig: SiteConfig = {
  title: 'EasyDoc',
  description: 'EasyDoc - 现代化文档站点',
  baseUrl: 'https://docs.easycoda.com',
  ogImage: '/logo.png',
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  nav: [  // 页眉导航项
    {
      label: 'nav.home',
      path: '/'
    },
    {
      label: 'nav.getting-started', // i18n 键 —— 通过 useTranslation() 解析
      children: [
        {
          label: 'Getting Started', // i18n 键 —— 通过 useTranslation() 解析
          path: '/getting-started/getting-started',
        },
        {
          label: 'Configuration',
          path: '/getting-started/configuration',
        }
      ],
    },
    {
      label: 'nav.guide',
      children: [
        {
          label: 'Markdown Features',
          path: '/guides/markdown-syntax',
        },
        {
          label: 'Search',
          path: '/guides/search',
        },
      ],
    },
    {
      label: 'nav.github',
      path: 'https://github.com/easycoda/easydoc',
      external: true,
    },
  ],
  footer: {
    copyright: `© ${new Date().getFullYear()} EasyDoc. 保留所有权利。`,
    links: [
      { text: 'EasyCoda', link: 'https://easycoda.com' },
      { text: 'GitHub', link: 'https://github.com/easycoda/easydoc' },
    ],
  },
  socialLinks: [
    {
      icon: 'Github',
      link: 'https://github.com/easycoda/easydoc',
      label: 'GitHub',
    },
    {
      icon: 'Twitter',
      link: 'https://twitter.com/@easy_coda',
      label: 'Twitter',
    },
  ],
};
```

### SiteConfig 参考

| 字段 | 类型 | 必填 | 描述 |
|---|---|---|---|
| `title` | `string` | 是 | 站点标题，用于浏览器标签页、页眉及 Open Graph 元标签。 |
| `description` | `string` | 是 | 站点描述，用于 `<meta name="description">` 和 Open Graph 标签。 |
| `logo` | `string` | 否 | 页眉中显示的 Logo 图片路径，通常为 public 目录中的 `/logo.png`。 |
| `baseUrl` | `string` | 否 | 用于 SEO 的规范基础 URL，会拼接到 `<link rel="canonical">` 和 Open Graph 图片 URL 的路径前。 |
| `locales` | `Locale[]` | 是 | 支持的语言代码，必须与插件选项中的 `locales` 数组一致。 |
| `defaultLocale` | `Locale` | 是 | 默认语言，决定用户首次访问时的站点语言。 |
| `nav` | `NavLink[]` | 是 | 页眉导航项，支持嵌套下拉菜单和外部链接。 |
| `footer` | `FooterConfig` | 是 | 页脚配置，包含版权文字和链接列表。 |
| `ogImage` | `string` | 否 | Open Graph 图片路径（如 `/logo.png`），在元标签中会拼接 `baseUrl`。 |
| `socialLinks` | `SocialLink[]` | 否 | 显示在站点页脚的社交或外部链接，每项包含图标（Lucide 图标名称）、链接和标签。 |

---

## NavLink 参考

`siteConfig.nav` 中的每一项都是一个 `NavLink`，包含以下字段：

| 字段 | 类型 | 必填 | 描述 |
|---|---|---|---|
| `label` | `string` | 是 | 父菜单项使用 i18n 键（如 `"nav.guide"`），子项使用直接显示文本（如 `"Getting Started"`）。 |
| `path` | `string` | 否 | URL 路径或完整 URL，仅作为下拉触发器的父项可省略。无需语言前缀。 |
| `external` | `boolean` | 否 | 若为 `true`，链接将在新标签页中打开，并附带 `rel="noopener noreferrer"`。 |
| `children` | `NavLink[]` | 否 | 嵌套导航项，在桌面端渲染为下拉菜单，在移动端渲染为可折叠区块。 |

`NavLink` 中的每一项都将在页眉组件中渲染。

### 导航规则

- **父项**（带有 `children`）不需要 `path`，它们充当下拉触发器。
- **叶子项**（无 `children`）需要 `path` 指向文档路由或外部 URL。
- **i18n 键**（如 `"nav.guide"`）在渲染时通过 `useTranslation()` Hook 解析。请在各语言文件中定义相应的键（参见 [i18n 配置](#i18n-配置)）。

---

## i18n 配置

EasyDoc 使用基于 Zustand 和 TypeScript 构建的轻量级 i18n 系统，所有 UI 字符串均以语言为键定义为翻译对象。

### 翻译文件

翻译文件位于 `src/i18n/`：

- `src/i18n/en.ts` —— 英文翻译
- `src/i18n/zh.ts` —— 中文翻译

每个文件默认导出一个符合 `UITranslations` 接口的对象：

```typescript
// src/i18n/en.ts
import type { UITranslations } from "@/types/i18n";

const en: UITranslations = {
  "nav.home": "Home",
  "nav.guide": "Guide",
  "search.placeholder": "Search documentation...",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.system": "System",
  "toc.title": "On This Page",
  "notfound.title": "Page Not Found",
  "notfound.back": "Back to Home",
  "home.hero.title": "Beautiful Documentation Made Simple",
  "home.hero.cta": "Get Started",
  "home.hero.secondary": "Learn More",
  "home.features.title": "Key Features",
  "sidebar.toggle": "Toggle sidebar",
  "doc.onThisPage": "On This Page",
  "doc.notFound": "Document not found.",
  "doc.loading": "Loading document...",
  "footer.copyright": "© 2026 EasyDoc. All rights reserved.",
};

export default en;
```

### UITranslations 接口

`UITranslations` 类型（定义于 `src/types/i18n.ts`）是一个可索引的字符串映射。已知键包括：

| 键 | 使用位置 | 描述 |
|---|---|---|
| `nav.home` | 页眉 / 首页链接 | 首页导航标签 |
| `nav.guide` | 页眉导航 | 指南下拉标签 |
| `nav.api` | 页眉导航 | API 下拉标签 |
| `nav.github` | 页眉导航 | GitHub 链接标签 |
| `search.placeholder` | 搜索输入框 | 占位文字 |
| `search.empty` | 搜索结果 | 空状态提示 |
| `theme.light` | 主题切换器 | 亮色模式标签 |
| `theme.dark` | 主题切换器 | 暗色模式标签 |
| `theme.system` | 主题切换器 | 跟随系统标签 |
| `toc.title` | 目录 | 目录标题文字 |
| `sidebar.toggle` | 移动端侧边栏 | 切换按钮 aria-label |
| `doc.onThisPage` | 文档页面 | 目录标题文字 |
| `doc.notFound` | 文档页面 | 404 提示信息 |
| `doc.loading` | 文档页面 | 加载状态文字 |
| `notfound.title` | 404 页面 | 页面标题 |
| `notfound.description` | 404 页面 | 描述文字 |
| `notfound.back` | 404 页面 | 返回首页链接 |
| `home.hero.title` | 首页 | Hero 区域标题 |
| `home.hero.subtitle` | 首页 | Hero 区域副标题 |
| `home.hero.cta` | 首页 | 主要 CTA 按钮 |
| `home.hero.secondary` | 首页 | 次要 CTA 按钮 |
| `home.features.title` | 首页 | 特性区域标题 |
| `footer.copyright` | 页脚 | 版权文字 |

### useTranslation() Hook

从 `src/i18n/index.ts` 导入 `useTranslation`，以获取当前语言的翻译对象：

```typescript
import { useTranslation } from "@/i18n";

function MyComponent() {
  const t = useTranslation();
  return <h1>{t["home.hero.title"]}</h1>;
}
```

还有一个便捷包装器 `useT(key)`，可直接返回单个字符串：

```typescript
import { useT } from "@/i18n";

function MyComponent() {
  const title = useT("home.hero.title");
  return <h1>{title}</h1>;
}
```

该 Hook 从 Zustand `appStore` 中读取当前语言。若某个键在当前语言中缺失，则回退到英文。

### 添加新语言

1. 创建新的翻译文件：`src/i18n/fr.ts`（参照 `en.ts` 的结构）。
2. 在 `src/types/i18n.ts` 的 `Locale` 类型中添加新语言代码：

   ```typescript
   export type Locale = "en" | "zh" | "fr";
   ```

3. 在 `src/i18n/index.ts` 中注册翻译：

   ```typescript
   import fr from "./fr";

   const translations: Record<Locale, UITranslations> = { en, zh, fr };
   ```

4. 将语言代码添加到 `vite.config.ts`（插件选项）和 `src/lib/siteConfig.ts`（站点配置）中的 `locales` 数组。
5. 创建对应的文档目录：`docs/fr/`。

---

## 构建输出

运行 `pnpm run build` 后，输出目录结构如下：

```text
dist/
├── index.html                  # 首页（默认语言）
├── search-index.json           # 全文搜索索引
├── manifest-en.json            # 英文导航清单
├── manifest-zh.json            # 中文导航清单
├── stats.html                  # Bundle 分析报告
├── robots.txt                  # Robots 排除规则
├── logo.svg                    # 站点 Logo（从 docs/ 复制）
├── easycoda-runtime.min.js     # 最小化运行时辅助文件
├── en/
│   ├── index.html              # 英文首页
│   ├── getting-started/
│   │   ├── getting-started.html
│   │   └── configuration.html
│   └── guides/
│       ├── search.html
│       └── markdown-syntax.html
├── zh/
│   ├── index.html              # 中文首页
│   ├── getting-started/
│   │   ├── getting-started.html
│   │   └── configuration.html
│   └── guides/
│       ├── search.html
│       └── markdown-syntax.html
└── assets/
    ├── index-<hash>.js         # 主客户端 Bundle
    ├── index-<hash>.css        # 主样式表
    ├── Doc-<hash>.js           # 文档页面代码块
    ├── Home-<hash>.js          # 首页代码块
    └── ...                     # 懒加载块、字体等
```

您可以在每个语言目录中按任意方式组织文件。插件会递归扫描并根据目录结构构建侧边栏树。各语言之间无需保持对称的目录布局——每种语言可拥有各自的章节和页面层级。

`dist/<lang>/` 下的每个 `.html` 文件都是一个**完全预渲染的页面**，包含：

- **SSG 内容**（位于 `<div id="root">` 内）—— 文档的渲染 HTML，在 JavaScript 加载前即可被爬虫和用户访问。
- **注水数据**（`<script id="easydoc-hydration-data">`）—— 包含页面的 frontmatter、目录标题、语言和文档路径的 JSON 数据。
- 对 `assets/` 中共享 SPA Bundle 的引用，负责处理客户端导航、搜索和主题切换。
- SEO 头部数据。

`search-index.json` 文件包含一个由 `SearchIndexEntry` 对象（标题、纯文本内容、路径、语言）组成的扁平数组，用于客户端全文搜索。

`manifest-<lang>.json` 文件包含每种语言的侧边栏导航树，在构建时和运行时导航中使用。

---

## Frontmatter 参考

`docs/` 中的每个 Markdown 文档顶部都可以包含 YAML frontmatter 块，支持以下字段：

```yaml
---
title: 我的页面标题         # 必填 —— 用于 <title>、侧边栏和面包屑
description: 简短摘要       # 可选 —— 用于 <meta name="description">
order: 10                   # 可选 —— 侧边栏排序（数值越小越靠前）
---
```

| 字段 | 类型 | 必填 | 默认值 | 描述 |
|---|---|---|---|---|
| `title` | `string` | **是** | — | 文档标题，显示在浏览器标签页、侧边栏和页面标题中。 |
| `description` | `string` | 否 | — | 用于 `<meta name="description">` 和 Open Graph 标签的简短描述。 |
| `order` | `number` | 否 | — | 侧边栏排序序号，数值越小越靠前；未设置的页面按字母顺序排列。 |

`title` 和 `description` 也会用作页面头部元数据。

## 故障排查

### Markdown 文件不显示

请确保 Markdown 文件位于语言目录下（`docs/en/`、`docs/zh/` 等）。直接放置在 `docs/` 根目录（任何语言目录之外）的文件将被忽略。

### 语法高亮不生效

请确认您使用了带语言标识符的围栏代码块：

````text
❌ 错误 —— 未指定语言：
```
const x = 1;
```

✅ 正确 —— 已指定语言：
```typescript
const x = 1;
```
````

### 嵌套路由出现 404

在开发环境中，Vite 会自动处理 SPA 回退。在生产环境中，请配置静态文件服务器对所有路由返回 `index.html`：

**Nginx 示例：**

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```