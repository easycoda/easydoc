# Spec: ZH Getting Started — `docs/zh/guide/getting-started.md`

## Current State (Problems)
- Mirrors EN getting-started but with Chinese translation
- References `pnpm create easydoc` (FICTIONAL)
- References fictional scaffolded structure

## Required Changes

### REMOVE
1. "创建新项目" section with `pnpm create easydoc my-docs`
2. The fictional project structure

### REPLACE WITH: "克隆项目"
```bash
git clone <repo-url> easydoc
cd easydoc
pnpm install
```

### REPLACE WITH: "替代方案：复制插件到现有项目"
Same as EN version:
1. 复制 `src/plugins/vite-plugin-easydoc.ts` 和相关文件
2. 安装依赖
3. 创建 `docs/<lang>/` 目录
4. 在 `vite.config.ts` 中配置

### KEEP (translated)
- 准备工作 (Prerequisites)
- 启动开发服务器 (`pnpm dev`, localhost:8080)
- 编写您的第一份文档
- 添加新页面
- 添加代码示例
- 构建生产版本 (`pnpm build` → `dist/`)

### UPDATE: "下一步" Links
- 安装配置 → `/zh/guide/installation`
- 配置 API → `/zh/api/config`

### ADD: Dev Server Note
"开发服务器支持 Markdown 文件的热模块替换（HMR）。同时通过 `/api/doc/:lang/*` 端点提供文档数据。"