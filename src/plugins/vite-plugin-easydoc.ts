import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import type { DocFrontmatter, TocHeading, DocNavItem, DocManifest, SearchIndexEntry, SearchIndex, DocPageData, DocNavRef } from '../types/doc';
import type { EasyDocPluginOptions } from '../types/vite-plugin';
// import { VIRTUAL_DOC_PREFIX, VIRTUAL_MANIFEST_PREFIX, VIRTUAL_SEARCH_INDEX } from '../types/vite-plugin';
import type { HydrationData, HomeHydrationData } from '../types/hydration';
import type { SeoMeta } from '../types/seo';
import { buildSeoMetaString, buildHomeSeoMeta } from './ssg-home';
import { getTranslations, getSiteTitle, getSiteDescription } from '../i18n/static';
import { siteConfig } from '../lib/siteConfig';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import markdownItAnchor from 'markdown-it-anchor';
import { full as markdownItEmoji } from 'markdown-it-emoji';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import { createHighlighter, type Highlighter, bundledLanguages } from 'shiki';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A doc located on disk, used internally. */
interface DocFile {
  fullPath: string;
  relativePath: string; // relative to docsRoot/<lang>/
  lang: string;
}

/** Pre-built data for one page, cached for SSG output. */
interface SsgPageEntry {
  html: string;
  frontmatter: DocFrontmatter;
  headings: TocHeading[];
  lang: string;
  /** Residual path after lang prefix, e.g. "guide/getting-started" */
  docPath: string;
  /** The virtual module path used as the import key, e.g. "en/guide/getting-started" */
  modulePath: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Convert a file path like "guide/getting-started" to a URL path
 * "/<lang>/guide/getting-started".
 */
function toDocPath(lang: string, relativePath: string): string {
  const clean = relativePath.replace(/\\/g, '/');
  return `/${lang}/${clean}`;
}

/**
 * Recursively split a slug into path segments: "guide/getting-started" => ["guide", "getting-started"]
 */
function pathSegments(slug: string): string[] {
  return slug.split('/').filter(Boolean);
}

/**
 * Derive a human-readable title from a filename segment.
 * "getting-started" => "Getting Started"
 */
function filenameToTitle(segment: string): string {
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Collect all .md files under a directory recursively.
 */
function collectDocFiles(dir: string, lang: string, baseDir: string): DocFile[] {
  const result: DocFile[] = [];
  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectDocFiles(fullPath, lang, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path
        .relative(baseDir, fullPath)
        .replace(/\\/g, '/')
        .replace(/\.md$/, '');
      result.push({ fullPath, relativePath, lang });
    }
  }
  return result;
}

/**
 * Extract H2/H3 headings from compiled HTML.
 */
function extractHeadings(html: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const headingRe = /<h([23])\s+id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(html)) !== null) {
    // Remove heading-anchor links before extracting text
    const innerHtml = match[3].replace(/<a[^>]*class="[^"]*heading-anchor[^"]*"[^>]*>.*?<\/a>/gi, '');
    headings.push({
      level: parseInt(match[1], 10),
      id: match[2],
      text: stripHtml(innerHtml),
    });
  }
  return headings;
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, '').trim();
}

/** Remove markdown syntax for plain-text extraction (search index). */
function stripMarkdown(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' ')  // fenced code blocks
    .replace(/`([^`]+)`/g, '$1')      // inline code
    .replace(/!\[.*?\]\(.*?\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // links
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2') // bold/italic
    .replace(/^#{1,6}\s+/gm, '')      // headings
    .replace(/^[*+-]\s+/gm, '')        // unordered lists
    .replace(/^\d+\.\s+/gm, '')       // ordered lists
    .replace(/\$\$?[^$]+\$\$?/g, ' ') // math
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Markdown compiler
// ---------------------------------------------------------------------------

class MarkdownCompiler {
  private md: MarkdownIt;
  private highlighter: Highlighter | null = null;
  private initialized = false;

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    this.md.use(markdownItAnchor, {
      level: [2, 3],
      permalink: markdownItAnchor.permalink.linkInsideHeader({
        symbol: '🔗',
        class: 'heading-anchor',
        placement: 'after',
        renderAttrs: (_slug, _state) => ({
          'aria-label': 'Link to this section',
          'data-anchor-link': '',
        }),
      }),
    });

    // Register markdown-it-emoji for :shortcode: rendering to Unicode emoji
    this.md.use(markdownItEmoji);

    // Register markdown-it-texmath for KaTeX rendering ($$ display, $ inline)
    this.md.use(texmath, {
      engine: katex,
      delimiters: ['dollars', 'brackets'],
      katexOptions: { macros: {} },
    });
  }

  private getHighlighter(): Highlighter | null {
    return this.highlighter;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.highlighter = await createHighlighter({
      themes: ['vitesse-light', 'vitesse-dark'],
      langs: Object.keys(bundledLanguages)
      // langs: [
      //   'javascript', 'typescript', 'tsx', 'jsx',
      //   'html', 'css', 'json', 'yaml', 'toml',
      //   'bash', 'shell', 'sh',
      //   'python', 'rust', 'go', 'java', 'c', 'cpp',
      //   'markdown', 'md', 'sql',
      //   'vue', 'svelte',
      // ],
    });
    this.initialized = true;

    // Use shiki for fenced code blocks
    const originalFence = this.md.renderer.rules.fence;
    const self = this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.md.renderer.rules.fence = function (
      this: any,
      tokens: Token[],
      idx: number,
      options: any,
      env: any,
      slf: any,
    ) {
      const token = tokens[idx];
      const code = (token.content || '').replace(/\n$/, '');
      const lang = token.info?.trim().split(/\s+/)[0] || 'text';

      // Math guard — render as displayed KaTeX math
      if (lang === 'math') {
        try {
          return `<p class="katex-display">${katex.renderToString(code.trim(), { displayMode: true, throwOnError: false })}</p>`;
        } catch {
          return `<pre><code>${escapeHtml(code)}</code></pre>`;
        }
      }

      // Mermaid guard — skip shiki, output raw mermaid container
      if (lang === 'mermaid') {
        return `<pre><code class="language-mermaid">${escapeHtml(code.trim())}</code></pre>`;
        // return `<pre class="mermaid">${escapeHtml(code.trim())}</pre>`;
      }

      const hl = self.getHighlighter();

      if (hl) {
        try {
          const result = hl.codeToHtml(code, {
            lang,
            themes: { dark: 'vitesse-dark', light: 'vitesse-light' },
          });
          return `<div class="code-block">${result}</div>`;
        } catch {
          // Fallback to markdown-it default
        }
      }

      if (originalFence) {
        return originalFence(tokens, idx, options, env, slf);
      }
      return `<pre><code class="language-${escapeAttr(lang)}">${escapeHtml(code)}</code></pre>`;
    };
  }

  compile(raw: string): { html: string; frontmatter: DocFrontmatter; headings: TocHeading[] } {
    const parsed = matter(raw);
    const frontmatter: DocFrontmatter = {
      title: parsed.data.title || '',
      ...parsed.data,
    };
    const html = this.md.render(parsed.content);
    const headings = extractHeadings(html);
    return { html, frontmatter, headings };
  }
}

// ---------------------------------------------------------------------------
// Plugin Implementation
// ---------------------------------------------------------------------------

export function vitePluginEasyDoc(options: EasyDocPluginOptions): Plugin {
  const {
    docsRoot,
    locales,
    outDir: _outDir,
  } = options;

  let resolvedDocsRoot = docsRoot;
  const compiler = new MarkdownCompiler();

  // -----------------------------------------------------------------------
  // Virtual Module IDs
  // -----------------------------------------------------------------------

  // const DOC_PREFIX = VIRTUAL_DOC_PREFIX;
  // const MANIFEST_PREFIX = VIRTUAL_MANIFEST_PREFIX;
  // const SEARCH_INDEX_ID = VIRTUAL_SEARCH_INDEX;

  // function docIdToModulePath(id: string): string | null {
  //   if (id.startsWith(DOC_PREFIX)) return id.slice(DOC_PREFIX.length);
  //   return null;
  // }

  // function manifestIdToLang(id: string): string | null {
  //   if (id.startsWith(MANIFEST_PREFIX)) return id.slice(MANIFEST_PREFIX.length);
  //   return null;
  // }

  // Resolve virtual "path" => absolute .md file path
  function resolveMdFile(modulePath: string): string {
    // modulePath format: "<lang>/<rest...>"
    const idx = modulePath.indexOf('/');
    if (idx === -1) {
      // Single-segment path under lang root, like "en" => "en/index.md"
      return path.join(resolvedDocsRoot, modulePath, 'index.md');
    }
    return path.join(resolvedDocsRoot, modulePath + '.md');
  }

  function docPathToLang(modulePath: string): string {
    const idx = modulePath.indexOf('/');
    return idx === -1 ? modulePath : modulePath.slice(0, idx);
  }

  function docPathToResidual(modulePath: string): string {
    const idx = modulePath.indexOf('/');
    return idx === -1 ? '' : modulePath.slice(idx + 1);
  }

  // -----------------------------------------------------------------------
  // Manifest / nav builder
  // -----------------------------------------------------------------------

  function buildManifest(lang: string): DocManifest {
    const langDir = path.join(resolvedDocsRoot, lang);
    const files = collectDocFiles(langDir, lang, langDir);

    // Build a trie from file relative paths
    const root: Record<string, unknown> = {};
    for (const file of files) {
      const segments = pathSegments(file.relativePath);
      let node = root;

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        if (!node[seg]) {
          node[seg] = { __files: [] };
        }
        const child = node[seg] as Record<string, unknown>;
        if (i === segments.length - 1) {
          (child.__files as DocFile[]).push(file);
        }
        node = child;
      }
    }

    function buildNav(obj: Record<string, unknown>, currentPath: string): DocNavItem[] {
      const entries: DocNavItem[] = [];

      for (const [key, val] of Object.entries(obj)) {
        if (key === '__files') continue;
        const child = val as Record<string, unknown>;
        const childFiles = (child.__files as DocFile[] | undefined) ?? [];
        const childPath = currentPath ? `${currentPath}/${key}` : key;

        // If there's a direct .md at this level, use its frontmatter
        let title = filenameToTitle(key);
        let order: number | undefined;
        const indexFile = childFiles.find(
          (f) => f.relativePath === childPath,
        );
        if (indexFile) {
          try {
            const raw = fs.readFileSync(indexFile.fullPath, 'utf-8');
            const parsed = matter(raw);
            title = parsed.data.title || title;
            order = parsed.data.order;
            if (parsed.data.sidebar === false) {
              // Skip this entry in nav but still recurse children
              if (Object.keys(child).length > 1) {
                const grandChildren = buildNav(child, childPath);
                entries.push(...grandChildren);
              }
              continue;
            }
          } catch {
            // ignore read errors
          }
        } else {
          // Directory with .md files but no index — collect titles from children
        }

        const children = buildNav(child, childPath);

        // Check if any child file at this exact segment without index
        // e.g., if key is "guide" and there's no guide/index.md but guide/*.md
        const directFile = childFiles.find(
          (f) => f.relativePath === childPath,
        );

        const navItem: DocNavItem = {
          title,
          path: toDocPath(lang, directFile?.relativePath ?? childPath),
          ...(children.length > 0 ? { children } : {}),
          ...(order !== undefined ? { order } : {}),
          ...(directFile === undefined && children.length > 0 ? { isGroup: true } : {}),
        };

        entries.push(navItem);
      }

      // For entries with children but no explicit order, inherit the minimum
      // order from all descendants so directory nodes sort correctly.
      function collectMinOrder(item: DocNavItem): number | undefined {
        if (!item.children || item.children.length === 0) {
          return item.order;
        }
        const childOrders = item.children
          .map((child) => collectMinOrder(child))
          .filter((o): o is number => o !== undefined);
        return childOrders.length > 0 ? Math.min(...childOrders) : item.order;
      }

      for (const entry of entries) {
        if (entry.children && entry.children.length > 0 && entry.order === undefined) {
          const minOrder = collectMinOrder(entry);
          if (minOrder !== undefined) {
            entry.order = minOrder;
          }
        }
      }

      // Sort by order, then by title
      entries.sort((a, b) => {
        const oa = a.order ?? 9999;
        const ob = b.order ?? 9999;
        return oa - ob || a.title.localeCompare(b.title);
      });

      return entries;
    }

    const nav = buildNav(root, '');
    return { lang, nav };
  }

  // -----------------------------------------------------------------------
  // Prev / Next navigation helpers
  // -----------------------------------------------------------------------

  /**
   * 对 DocNavItem 树做深度优先遍历，生成按侧边栏顺序排列的扁平数组。
   * 遍历顺序：先访问根节点，再递归访问 children（与 DocSidebarItem 渲染顺序一致）。
   */
  function flattenNav(items: DocNavItem[]): DocNavRef[] {
    const result: DocNavRef[] = [];
    for (const item of items) {
      if (!item.isGroup) {
        result.push({ path: item.path, title: item.title });
      }
      if (item.children && item.children.length > 0) {
        result.push(...flattenNav(item.children));
      }
    }
    return result;
  }

  /**
   * 给定扁平数组和当前模块路径（如 "en/guide/getting-started"），
   * 返回当前文档的上一篇和下一篇 DocNavRef。
   * 匹配使用 modulePath（不带前导斜杠），与 load 钩子中的 modulePath 一致。
   */
  function computePrevNext(
    flat: DocNavRef[],
    modulePath: string,
  ): { prev: DocNavRef | undefined; next: DocNavRef | undefined } {
    // modulePath: "en/guide/getting-started"
    // flat item path: "/en/guide/getting-started"
    const normalizedPath = modulePath.startsWith('/') ? modulePath : `/${modulePath}`;
    const idx = flat.findIndex((item) => item.path === normalizedPath);
    if (idx === -1) {
      return { prev: undefined, next: undefined };
    }
    return {
      prev: idx > 0 ? flat[idx - 1] : undefined,
      next: idx < flat.length - 1 ? flat[idx + 1] : undefined,
    };
  }

  // -----------------------------------------------------------------------
  // Search index builder
  // -----------------------------------------------------------------------

  function buildSearchIndex(lang: string): SearchIndex {
    const entries: SearchIndexEntry[] = [];

    const langDir = path.join(resolvedDocsRoot, lang);
    const files = collectDocFiles(langDir, lang, langDir);

    for (const file of files) {
      try {
        const raw = fs.readFileSync(file.fullPath, 'utf-8');
        const parsed = matter(raw);
        const plainText = stripMarkdown(parsed.content);
        const section = file.relativePath.split('/')[0] || undefined;
        const sectionTitle = section ? filenameToTitle(section) : undefined;

        entries.push({
          title: (parsed.data.title as string) || filenameToTitle(path.basename(file.relativePath)),
          text: plainText,
          path: toDocPath(lang, file.relativePath),
          lang,
          section: sectionTitle,
        });
      } catch {
        // skip files that can't be read
      }
    }
    

    return entries;
  }

  // -----------------------------------------------------------------------
  // SSG helpers: collect all doc entries for SSG page generation
  // -----------------------------------------------------------------------

  function collectAllSsgEntries(): SsgPageEntry[] {
    const entries: SsgPageEntry[] = [];

    for (const lang of locales) {
      const langDir = path.join(resolvedDocsRoot, lang);
      if (!fs.existsSync(langDir)) continue;

      const files = collectDocFiles(langDir, lang, langDir);
      for (const file of files) {
        try {
          const raw = fs.readFileSync(file.fullPath, 'utf-8');
          const compiled = compiler.compile(raw);

          // Special case: index.md maps to the language index page (docPath = '')
          const isIndex = file.relativePath === 'index';
          const modulePath = isIndex
            ? lang
            : `${lang}/${file.relativePath}`;
          const docPath = isIndex ? '' : file.relativePath;

          entries.push({
            html: compiled.html,
            frontmatter: compiled.frontmatter,
            headings: compiled.headings,
            lang,
            docPath,
            modulePath,
          });
        } catch {
          // skip files that can't be compiled
        }
      }
    }

    return entries;
  }

  /**
   * Apply SSG transformations to an HTML string:
   * 1. Replace <div id="root"></div> with <div id="root">[full layout HTML with shell]</div>
   * 2. Set <title> from frontmatter
   * 3. Set <html lang="...">
   * 4. Inject hydration script before </body>
   *
   * @param htmlTemplate - 原始 index.html 模板
   * @param entry - SSG 页面条目（包含文章 HTML 和元数据）
   * @param hydrationData - 预构造的 hydration 数据（包含 prev/next）
   * @param fullLayoutHtml - 包含完整布局壳 + 文章内容的 HTML（用于 <div id="root">）
   */
  function applySsgTransform(htmlTemplate: string, entry: SsgPageEntry, hydrationData: HydrationData, fullLayoutHtml: string): string {

    const hydrationScript = `<script>window.__HYDRATION_DATA__ = ${JSON.stringify(hydrationData)};</script>`;

    let result = htmlTemplate;

    // Replace root div placeholder — 使用完整布局壳 HTML（含 Header/Sidebar/Footer）
    // hydrationData.html 保持为 entry.html（仅文章 HTML），供客户端 hydration 用
    result = result.replace(
      /<div\s+id="root"\s*>\s*<\/div>/,
      `<div id="root">${fullLayoutHtml}</div>`,
    );

    // Build SEO meta for doc pages
    const docTitle = entry.frontmatter.title || siteConfig.title;
    const docDescription = entry.frontmatter.description || siteConfig.description;
    const canonical = siteConfig.baseUrl
      ? `${siteConfig.baseUrl}/${entry.lang}${entry.docPath ? `/${entry.docPath}` : '/index'}`
      : `/${entry.lang}${entry.docPath ? `/${entry.docPath}` : ''}`;

    const seoMeta: SeoMeta = {
      title: docTitle,
      description: docDescription,
      ogTitle: docTitle,
      ogDescription: docDescription,
      ogType: 'article',
      canonical,
      ogUrl: canonical,
      lang: entry.lang,
      ...(siteConfig.ogImage ? { ogImage: siteConfig.ogImage } : {}),
    };

    const seoMetaString = buildSeoMetaString(seoMeta);

    // Update <title> and inject SEO meta after it
    // const escapedTitle = escapeHtml(docTitle);
    result = result.replace(
      /<title>[^<]*<\/title>/,
      `${seoMetaString}`,
    );

    // Update <html lang="...">
    result = result.replace(/<html\s+lang="[^"]*"/, `<html lang="${entry.lang}"`);

    // Inject hydration script before </body>
    result = result.replace('</body>', `${hydrationScript}\n</body>`);

    return result;
  }

  // -----------------------------------------------------------------------
  // Plugin object
  // -----------------------------------------------------------------------

  return {
    name: 'vite-plugin-easydoc',
    enforce: 'pre',

    async config(_config, { command }) {
      if (command !== 'build') return;

      // Ensure compiler is initialized before SSG collection
      await compiler.initialize();
    },

    configResolved(config: ResolvedConfig) {
      resolvedDocsRoot = path.resolve(config.root, docsRoot);
      if (!fs.existsSync(resolvedDocsRoot)) {
        console.warn(
          `[vite-plugin-easydoc] docsRoot directory does not exist: ${resolvedDocsRoot}`,
        );
      }
    },

    resolveId(source: string) {
      // Intercept virtual doc imports
      // if (source.startsWith(DOC_PREFIX)) return '\0' + source;
      // if (source.startsWith(MANIFEST_PREFIX)) return '\0' + source;
      // if (source === SEARCH_INDEX_ID) return '\0' + SEARCH_INDEX_ID;
      // return null;
    },

    async load(id: string) {
      const rawId = id.startsWith('\0') ? id.slice(1) : id;

      // --- Doc module ---
      // if (rawId.startsWith(DOC_PREFIX)) {
      //   const modulePath = docIdToModulePath(rawId);
      //   if (!modulePath) return null;

      //   const mdPath = resolveMdFile(modulePath);
      //   if (!fs.existsSync(mdPath)) {
      //     return `export default { html: '', frontmatter: { title: '' }, headings: [], lang: '', path: '' };`;
      //   }

      //   const raw = fs.readFileSync(mdPath, 'utf-8');

      //   // Ensure compiler is initialized
      //   await compiler.initialize();

      //   const lang = docPathToLang(modulePath);
      //   const residual = docPathToResidual(modulePath);
      //   const compiled = compiler.compile(raw);

      //   // Compute prev/next navigation
      //   const manifest = buildManifest(lang);
      //   const flatNav = flattenNav(manifest.nav);
      //   const { prev, next } = computePrevNext(flatNav, modulePath);

      //   const data: DocPageData = {
      //     html: compiled.html,
      //     frontmatter: compiled.frontmatter,
      //     headings: compiled.headings,
      //     lang,
      //     path: residual,
      //     ...(prev ? { prev } : {}),
      //     ...(next ? { next } : {}),
      //   };

      //   return `export default ${JSON.stringify(data)};`;
      // }

      // --- Manifest module ---
      // if (rawId.startsWith(MANIFEST_PREFIX)) {
      //   const lang = manifestIdToLang(rawId);
      //   if (!lang) return null;

      //   const manifest = buildManifest(lang);
      //   return `export default ${JSON.stringify(manifest)};`;
      // }

      // --- Search index ---
      // if (rawId === SEARCH_INDEX_ID) {
      //   const index = buildSearchIndex();
      //   return `export default ${JSON.stringify(index)};`;
      // }

      return null;
    },

    transformIndexHtml(html: string, _ctx: { filename: string; path: string; bundle?: unknown }): string {
      // We don't modify the main index.html via transformIndexHtml.
      // SSG pages are generated in generateBundle.
      // However, we still modify the root index.html if it's a landing page.
      // For now, we keep the root index.html as-is (SPA shell).
      return html;
    },

    configureServer(server: ViteDevServer) {
      // Serve search-index.json
      // server.middlewares.use('/search-index.json', (_req, res) => {
      //   const index = buildSearchIndex();
      //   res.setHeader('Content-Type', 'application/json');
      //   res.end(JSON.stringify(index));
      // });

      // Serve per-language manifest JSON
      for (const lang of locales) {
        server.middlewares.use(`/search-index-${lang}.json`, (_req, res) => {
          const index = buildSearchIndex(lang);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(index));
        });

        server.middlewares.use(`/manifest-${lang}.json`, (_req, res) => {
          const manifest = buildManifest(lang);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(manifest));
        });
      }

      // Serve /api/doc/:lang/* — dev-mode HTTP endpoint for DocPageData
      server.middlewares.use(async (req, res, next) => {
        // Only handle GET requests to /api/doc/
        if (!req.url || !req.url.startsWith('/api/doc/') || req.method !== 'GET') {
          return next();
        }

        // Strip query string
        const urlWithoutQuery = req.url.split('?')[0];

        // Parse: /api/doc/<lang>/<rest...>
        const residual = urlWithoutQuery.slice('/api/doc/'.length);
        if (!residual) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
          return;
        }

        const firstSlash = residual.indexOf('/');
        const lang = firstSlash === -1 ? residual : residual.slice(0, firstSlash);
        const docPath = firstSlash === -1 ? '' : residual.slice(firstSlash + 1);

        // Validate lang
        if (!locales.includes(lang)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
          return;
        }

        // Construct modulePath for resolveMdFile
        const modulePath = docPath ? `${lang}/${docPath}` : lang;

        const mdPath = resolveMdFile(modulePath);
        if (!fs.existsSync(mdPath)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
          return;
        }

        try {
          const raw = fs.readFileSync(mdPath, 'utf-8');
          await compiler.initialize();
          const compiled = compiler.compile(raw);

          // Compute prev/next navigation
          const manifest = buildManifest(lang);
          const flatNav = flattenNav(manifest.nav);
          const { prev, next } = computePrevNext(flatNav, modulePath);

          const data: DocPageData = {
            html: compiled.html,
            frontmatter: compiled.frontmatter,
            headings: compiled.headings,
            lang,
            path: docPath,
            ...(prev ? { prev } : {}),
            ...(next ? { next } : {}),
          };

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        } catch {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    },

    // In Vite, the built index.html is NOT in the Rollup bundle.
    // We use closeBundle to read the already-written dist/index.html,
    // apply SSG transforms, and write out additional pages.
    async closeBundle() {
      const distDir = path.resolve(resolvedDocsRoot, '..', 'dist');
      const builtHtmlPath = path.join(distDir, 'index.html');

      if (!fs.existsSync(builtHtmlPath)) {
        console.warn('[vite-plugin-easydoc] Cannot find built index.html for SSG generation');
        return;
      }

      const htmlTemplate = fs.readFileSync(builtHtmlPath, 'utf-8');

      // Collect and compile all doc pages
      const entries = collectAllSsgEntries();

      // 预计算所有语言的 manifest 和 translations（避免循环中重复计算）
      const manifestMap = new Map<string, DocManifest>();
      for (const lang of locales) {
        manifestMap.set(lang, buildManifest(lang));
      }

      const translationsMap = new Map<string, Record<string, string>>();
      for (const lang of locales) {
        translationsMap.set(lang, getTranslations(lang));
      }

      // Pre-compute flattened nav per language (for prev/next injection)
      const langFlatNavMap = new Map<string, DocNavRef[]>();
      for (const [lang, manifest] of manifestMap) {
        langFlatNavMap.set(lang, flattenNav(manifest.nav));
      }

      // 动态导入 SSR 渲染模块（在 closeBundle 运行时，tsx 负责转译 TSX 和 @/ 别名）
      const { renderDocPageToString, renderHomePageToString } = await import('../ssr/ssg-render');

      // Generate a static HTML file for each doc page
      for (const entry of entries) {
        const manifest = manifestMap.get(entry.lang)!;
        const translations = translationsMap.get(entry.lang)!;
        const currentPath = `/${entry.lang}${entry.docPath ? '/' + entry.docPath : ''}`;

        // 在循环中提前构造 hydrationData（prev/next 计算提前）
        const outputPath = entry.docPath
          ? `${entry.lang}/${entry.docPath}`
          : entry.lang;

        const langFlatNav = langFlatNavMap.get(entry.lang) ?? [];
        const { prev, next } = computePrevNext(langFlatNav, entry.modulePath);

        const hydrationData: HydrationData = {
          lang: entry.lang,
          path: outputPath,
          frontmatter: {
            title: entry.frontmatter.title,
            ...(entry.frontmatter.description !== undefined ? { description: entry.frontmatter.description } : {}),
            ...(entry.frontmatter.order !== undefined ? { order: entry.frontmatter.order } : {}),
          },
          html: entry.html,
          headings: entry.headings.map((h) => ({
            id: h.id,
            text: h.text,
            level: h.level,
          })),
          ...(prev ? { prev: { path: prev.path, title: prev.title } } : {}),
          ...(next ? { next: { path: next.path, title: next.title } } : {}),
        };

        // 使用 SSR 渲染生成完整的布局壳静态 HTML
        const fullLayoutHtml = renderDocPageToString(entry, manifest, translations, siteConfig, currentPath, hydrationData);

        const ssgHtml = applySsgTransform(htmlTemplate, entry, hydrationData, fullLayoutHtml);

        // Determine output path:
        // For doc pages: "<lang>/<docPath>.html"
        // For lang index (docPath === ''): "<lang>/index.html"
        let fileName: string;
        if (entry.docPath) {
          fileName = `${entry.lang}/${entry.docPath}.html`;
        } else {
          fileName = `${entry.lang}/index.html`;
        }

        const fullPath = path.join(distDir, fileName);
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, ssgHtml, 'utf-8');

        console.log(`[vite-plugin-easydoc] SSG page written: ${fileName}`);
      }

      // ── Generate SSG home pages ───────────────────────────────────────
      // For each locale, build a static home page with SEO meta.
      // Guard: if dist/<lang>/index.html was already created by the doc SSG
      // step above (because docs/<lang>/index.md exists), skip the Home page
      // SSG write for that language so the doc index takes precedence.
      //
      // IMPORTANT: root dist/index.html (builtHtmlPath) for the defaultLocale
      // is always written, regardless of whether docs/<defaultLocale>/index.md
      // exists. The per-locale check only governs dist/<lang>/index.html.
      const defaultLocale = siteConfig.defaultLocale;
      const translations = getTranslations(defaultLocale);
      const title = getSiteTitle(defaultLocale, siteConfig);
      const description = getSiteDescription(defaultLocale, siteConfig);

      // Build SEO meta for home page
      const seoMeta = buildHomeSeoMeta(defaultLocale, siteConfig, translations);
      const seoMetaString = buildSeoMetaString(seoMeta);

      // 使用 SSR 渲染生成完整的 home 页面布局壳静态 HTML
      const fullHomeHtml = renderHomePageToString('', translations, siteConfig, defaultLocale);

      // Build HomeHydrationData
      const homeHydrationData: HomeHydrationData = {
        lang: defaultLocale,
        path: '',
        title,
        description,
        html: fullHomeHtml,
      };
      const hydrationScript = `<script>window.__HYDRATION_DATA__ = ${JSON.stringify(homeHydrationData)};</script>`;

      // Apply transforms to HTML template
      let homePageHtml = htmlTemplate;

      // Replace root div with full home HTML（含 Header + Footer 布局壳）
      // hydrationData.html 保持为 homeHtml（不含布局壳）
      homePageHtml = homePageHtml.replace(
        /<div\s+id="root"\s*>\s*<\/div>/,
        `<div id="root">${fullHomeHtml}</div>`,
      );

      // Replace <title> and inject SEO meta
      homePageHtml = homePageHtml.replace(
        /<title>[^<]*<\/title>/,
        `${seoMetaString}`,
      );

      // Update <html lang="...">
      homePageHtml = homePageHtml.replace(
        /<html\s+lang="[^"]*"/,
        `<html lang="${defaultLocale}"`,
      );

      // Inject hydration script before </body>
      homePageHtml = homePageHtml.replace(
        '</body>',
        `${hydrationScript}\n</body>`,
      );
      fs.writeFileSync(builtHtmlPath, homePageHtml, 'utf-8');
      console.log(`[vite-plugin-easydoc] SSG home page written: index.html (root, ${defaultLocale})`);

    },

    buildEnd() {
      // Emit per-language manifest JSON files
      for (const lang of locales) {
        // Emit search-index.json
        const searchIndex = buildSearchIndex(lang);
        this.emitFile({
          type: 'asset',
          fileName: `search-index-${lang}.json`,
          source: JSON.stringify(searchIndex),
        });

        const manifest = buildManifest(lang);
        this.emitFile({
          type: 'asset',
          fileName: `manifest-${lang}.json`,
          source: JSON.stringify(manifest),
        });
      }
    },
  };
}