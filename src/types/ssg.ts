import type { DocFrontmatter, TocHeading, DocManifest } from './doc';
import type { SiteConfig } from './config';

/**
 * 预构建的单页文档条目，用于 SSG 页面生成。
 * 从 vite-plugin-easydoc.ts 的 collectAllSsgEntries 产出。
 */
export interface SsgPageEntry {
  /** 编译后的文章 HTML */
  html: string;
  /** 文档 frontmatter 元数据 */
  frontmatter: DocFrontmatter;
  /** TOC 标题列表 */
  headings: TocHeading[];
  /** 语言代码，如 "en" / "zh" */
  lang: string;
  /**
   * 去掉语言前缀后的剩余路径。
   * 例如 "guide/getting-started"。
   * 对于语言根页面（index.md），此值为空字符串。
   */
  docPath: string;
  /**
   * 虚拟模块路径，用作 import key。
   * 格式："<lang>" 或 "<lang>/<docPath>"。
   */
  modulePath: string;
}

/**
 * SSR 渲染所需的完整上下文数据。
 * 由 vite-plugin-easydoc.ts 的 closeBundle 钩子组装，
 * 传入 SSR 渲染入口（renderDocPageToString / renderHomePageToString）。
 */
export interface SsgRenderContext {
  /** 当前页面语言 */
  lang: string;
  /** 当前页面完整路径，如 "/en/guide/getting-started" 或 "/en" */
  currentPath: string;
  /** 是否为文档页面（true=doc 页面，false=home 页面） */
  onDocPage: boolean;
  /** 文档导航清单（仅 doc 页面时有值） */
  manifest?: DocManifest;
  /** 页面 TOC 标题（仅 doc 页面时有值） */
  headings?: TocHeading[];
  /** UI 翻译键值对 */
  translations: Record<string, string>;
  /** 站点全局配置 */
  siteConfig: SiteConfig;
}

/**
 * SSR Layout 组件的 Props。
 * SSR 环境下的 Layout 组件不同于客户端 Layout：
 * - 不依赖 useLocation / useParams
 * - 不依赖 useIsMobile
 * - 不包含 <Outlet />，直接渲染 children
 */
export interface SsgLayoutProps {
  /** SSR 渲染上下文 */
  context: SsgRenderContext;
  /** 页面主体内容（React 节点） */
  children: React.ReactNode;
}

/**
 * Doc 页面 SSR 渲染上下文的扩展接口。
 * 在 SsgRenderContext 的基础上增加了当前文档条目。
 */
export interface SsgDocPageContext extends SsgRenderContext {
  /** 当前文档的预编译条目 */
  entry: SsgPageEntry;
}