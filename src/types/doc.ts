/** Frontmatter parsed from a Markdown file */
export interface DocFrontmatter {
  title: string;
  description?: string;
  order?: number;
  /** Whether to show in sidebar (default: true) */
  sidebar?: boolean;
  /** Whether to show TOC (default: true) */
  toc?: boolean;
  [key: string]: unknown;
}

/** A heading extracted from the compiled HTML for TOC */
export interface TocHeading {
  id: string;
  text: string;
  /** 2 for H2, 3 for H3 */
  level: number;
}

/** 相邻文档的导航引用 */
export interface DocNavRef {
  /** 带语言前缀的完整路径，例如 "/en/guide/installation" */
  path: string;
  /** 文档标题 */
  title: string;
}

/** A document that has been fully resolved (HTML + metadata) */
export interface DocPageData {
  html: string;
  frontmatter: DocFrontmatter;
  headings: TocHeading[];
  lang: string;
  /** Residual path after lang prefix, e.g. "guide/getting-started" */
  path: string;
  /** 上一篇文档。如果是第一篇则为 undefined */
  prev?: DocNavRef;
  /** 下一篇文档。如果是最后一篇则为 undefined */
  next?: DocNavRef;
}

/** One node in the documentation navigation tree */
export interface DocNavItem {
  title: string;
  /** Full path including lang, e.g. "/en/guide/getting-started" */
  path: string;
  children?: DocNavItem[];
  order?: number;
  /** 纯目录分组节点，不对应实际文档页面 */
  isGroup?: boolean;
}

/** The full documentation manifest for a language */
export interface DocManifest {
  lang: string;
  nav: DocNavItem[];
}

/** A single entry in the search index */
export interface SearchIndexEntry {
  title: string;
  /** Plain text content for search */
  text: string;
  path: string;
  lang: string;
  /** Category for grouping, e.g. "Guide" */
  section?: string;
}

/** The entire search index */
export type SearchIndex = SearchIndexEntry[];