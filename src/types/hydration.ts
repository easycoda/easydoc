/** Data injected into each static HTML page for SPA hydration */
export interface HydrationData {
  lang: string;
  path: string;
  frontmatter: {
    title: string;
    description?: string;
    order?: number;
  };
  html: string;
  headings: Array<{ id: string; text: string; level: number }>;
  /** 上一篇文档导航引用 */
  prev?: { path: string; title: string };
  /** 下一篇文档导航引用 */
  next?: { path: string; title: string };
}

/** Lightweight hydration data for the home page — no Markdown headings array */
export interface HomeHydrationData {
  lang: string;
  /** Home page path is always an empty string, distinct from HydrationData.path's "<lang>/<docPath>" format */
  path: '';
  title: string;
  description: string;
  html: string;
}