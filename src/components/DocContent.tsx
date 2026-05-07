import { useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { DocFrontmatter, TocHeading } from '@/types/doc';
import type { UITranslations } from '@/types/i18n';
import { useTranslation } from '@/i18n';
import 'katex/dist/katex.min.css';

// ── Mermaid lazy-loading support ────────────────────────────────────
// We dynamically import mermaid (~500KB+) only when a document actually
// contains <code class="language-mermaid"> blocks.  The module is cached
// at the module level so it's fetched at most once per page session.

/** Type-only import so we can type the cache variable cleanly. */
import type mermaidType from 'mermaid';

let mermaidModule: typeof mermaidType | null = null;

async function loadMermaid(): Promise<typeof mermaidType> {
  if (mermaidModule) return mermaidModule;
  const mod = await import('mermaid');
  mermaidModule = mod.default;
  return mermaidModule;
}

// ── Props ───────────────────────────────────────────────────────────

interface DocContentProps {
  html: string;
  frontmatter: DocFrontmatter;
  headings: TocHeading[];
  onHeadingsReady?: (headings: TocHeading[]) => void;
  onHeadingsVisible?: (headingId: string) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Resolves the level of a heading element tag name.
 * 'H2' → 2, 'H3' → 3, etc. Returns 0 for non-headings.
 */
function headingLevelFromTag(tagName: string): number {
  const match = /^H([1-6])$/i.exec(tagName);
  return match ? parseInt(match[1], 10) : 0;
}

// ── Copy button injection ───────────────────────────────────────────

/**
 * SVG icon used for the copy button (clipboard icon).
 * Rendered as an inline SVG so no extra imports are needed.
 */
const CLIPBOARD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`;

const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide"><polyline points="20 6 9 17 4 12"/></svg>`;

/**
 * Injects a "Copy" button into every `<pre>` element inside the given container.
 *
 * Each `<pre>` is wrapped in a `<div class="relative group">` so the button
 * can be absolutely positioned at the top-right corner and appears on hover.
 *
 * The button copies the code text to the clipboard and shows a temporary
 * checkmark feedback for 2 seconds.
 */
function injectCopyButtons(container: HTMLElement, t: UITranslations): void {
  const preElements = container.querySelectorAll<HTMLPreElement>('pre');

  for (const pre of preElements) {
    // Skip if already wrapped (idempotent)
    if (pre.parentElement?.classList.contains('copy-code-wrapper')) continue;

    // Wrap the <pre> in a relative-positioned div
    const wrapper = document.createElement('div');
    wrapper.className = 'relative group copy-code-wrapper';

    // Build the copy button
    const button = document.createElement('button');
    button.type = 'button';
    button.className = [
      'absolute top-2 right-2 z-10',
      'opacity-0 group-hover:opacity-100 transition-opacity',
      'rounded-md p-1.5',
      'bg-muted/80 hover:bg-muted',
      'text-muted-foreground hover:text-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
    ].join(' ');
    button.setAttribute('aria-label', t['features.copyCode']);
    button.innerHTML = CLIPBOARD_SVG;

    // --- Click handler: copy code to clipboard ---
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const codeEl = pre.querySelector('code');
      const codeText = codeEl?.textContent ?? '';

      try {
        await navigator.clipboard.writeText(codeText);

        // Show checkmark for 2 seconds
        button.innerHTML = CHECK_SVG;
        button.setAttribute('aria-label', t['features.codeCopied']);

        setTimeout(() => {
          button.innerHTML = CLIPBOARD_SVG;
          button.setAttribute('aria-label', t['features.copyCode']);
        }, 2000);
      } catch {
        // Clipboard API failed — silently ignore (user may not have permissions)
      }
    });

    // Insert wrapper before the <pre>, then move <pre> and button into it
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
    wrapper.appendChild(button);
  }
}

/**
 * Process all unprocessed Mermaid diagrams in the given container.
 *
 * Strategy:
 *  - Query for `<code class="language-mermaid">` elements WITHOUT a
 *    `data-processed` attribute.
 *  - Assign each a stable `data-mermaid-id` so Mermaid can track them.
 *  - Run `mermaid.run()` only on the new nodes.
 *  - On success, mark each processed element with `data-processed="true"`
 *    so subsequent calls skip it.
 *
 * Mermaid is loaded lazily — the dynamic import only fires when the
 * container actually contains `.language-mermaid` elements.
 */
async function processMermaidDiagrams(container: HTMLElement): Promise<void> {
  // 1. Collect only unprocessed mermaid code blocks
  const codeElements = container.querySelectorAll<HTMLElement>(
    'pre code.language-mermaid:not([data-processed])',
  );
  if (codeElements.length === 0) return;

  // 2. Assign unique ids and build a node list
  let counter = 0;
  const nodeList: HTMLElement[] = [];

  for (const el of codeElements) {
    if (!el.isConnected) continue;
    if (el.hasAttribute('data-processed')) continue;

    if (!el.getAttribute('data-mermaid-id')) {
      counter++;
      el.setAttribute('data-mermaid-id', String(counter));
    }
    nodeList.push(el);
  }

  if (nodeList.length === 0) return;

  // 3. Lazy-load mermaid and run — errors on individual diagrams
  //    shouldn't crash the page
  try {
    const mermaid = await loadMermaid();
    await mermaid.run({ nodes: nodeList });

    // 4. Mark successfully processed nodes so we never re-process them
    for (const el of nodeList) {
      if (el.isConnected) {
        el.setAttribute('data-processed', 'true');
      }
    }
  } catch (err) {
    console.warn('Mermaid diagram processing failed:', err);
  }
}

// ── Component ───────────────────────────────────────────────────────

/** Prose className used for both SSR and CSR — must stay in sync. */
const PROSE_CLASS = [
  'prose prose-neutral max-w-none dark:prose-invert',
  'prose-headings:scroll-mt-20',
  'prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-2xl prose-h2:font-semibold prose-h2:tracking-tight',
  'prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl prose-h3:font-semibold prose-h3:tracking-tight',
  'prose-p:leading-7',
  'prose-a:font-medium prose-a:text-primary prose-a:underline prose-a:underline-offset-2 prose-a:decoration-primary/30 hover:prose-a:decoration-primary',
  'prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-medium',
  'prose-pre:border prose-pre:border-border prose-pre:!bg-muted/50',
  'prose-pre:[&_code]:bg-transparent prose-pre:[&_code]:p-0 prose-pre:[&_code]:rounded-none',
  'prose-img:rounded-lg prose-img:border prose-img:border-border',
  'prose-table:overflow-x-auto',
  'prose-th:border prose-th:border-border prose-th:bg-muted/50 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:text-sm prose-th:font-semibold',
  'prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2 prose-td:text-sm',
  'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
  'prose-hr:border-border',
].join(' ');

export function DocContent({
  html,
  frontmatter: _frontmatter,
  headings,
  onHeadingsReady,
  onHeadingsVisible,
}: DocContentProps): React.ReactElement {
  const contentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // `mermaid.initialize()` must only be called ONCE globally.
  const mermaidInitializedRef = useRef(false);

  // Track previous html to avoid unnecessary innerHTML writes.
  // This is the key fix: React re-renders (e.g. after an image loads)
  // will NOT overwrite innerHTML unless html has actually changed.
  const prevHtmlRef = useRef<string>('');

  // ── Client-side navigation ────────────────────────────────────────
  const navigate = useNavigate();
  const location = useLocation();

  // ── i18n ───────────────────────────────────────────────────────────
  const t = useTranslation();

  // ── Content Initialisation ────────────────────────────────────────
  const initializeContent = useCallback(async () => {
    // SSR 守卫：renderToString 不执行 useEffect，但显式守卫防范流式渲染场景
    if (typeof window === 'undefined') return;

    const container = contentRef.current;
    if (!container) return;

    // --- Set innerHTML only when html actually changes ---
    // This prevents React from destroying Mermaid SVGs on unrelated
    // re-renders (e.g. image onLoad events).
    if (prevHtmlRef.current !== html) {
      container.innerHTML = html;
      prevHtmlRef.current = html;
    }

    // --- Mermaid global initialisation (once) ---
    if (!mermaidInitializedRef.current) {
      try {
        const mermaid = await loadMermaid();
        mermaid.initialize({ startOnLoad: false, theme: 'default' });
        mermaidInitializedRef.current = true;
      } catch (err) {
        console.warn('Mermaid global initialization failed:', err);
      }
    }

    // --- Process Mermaid diagrams ---
    // Use setTimeout(0) to ensure DOM is settled after innerHTML write
    // before Mermaid tries to read the code blocks.
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        processMermaidDiagrams(container).then(resolve);
      }, 0);
    });

    // --- Inject copy buttons into code blocks ---
    // Must run AFTER Mermaid processing so Mermaid <pre> elements also
    // get copy buttons (Mermaid output is SVG, not code — but the original
    // <pre><code class="language-mermaid"> may still be in the DOM as a
    // fallback, so we handle both cases safely).
    injectCopyButtons(container, t);

    // --- Extract headings for TOC scroll-spy ---
    const headingElements = container.querySelectorAll('h2, h3');
    const extractedHeadings: TocHeading[] = [];

    headingElements.forEach((el) => {
      const id = el.getAttribute('id');
      const level = headingLevelFromTag(el.tagName);

      if (!id || level < 2) return;

      // Clone the element and strip .heading-anchor children so the
      // 🔗 permalink emoji is excluded from the TOC heading text.
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.heading-anchor').forEach((anchor) => anchor.remove());
      const text = clone.textContent?.trim() ?? '';

      if (text) {
        extractedHeadings.push({ id, text, level });
      }
    });

    if (extractedHeadings.length > 0) {
      onHeadingsReady?.(extractedHeadings);
    } else {
      // Fallback: use the pre-computed headings from props
      onHeadingsReady?.(headings);
    }

    // --- Set up IntersectionObserver for TOC scroll-spy ---
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const headingIds = new Set(extractedHeadings.map((h) => h.id));
    const targetElements: Element[] = [];

    headingElements.forEach((el) => {
      const id = el.getAttribute('id');
      if (id && headingIds.has(id)) {
        targetElements.push(el);
      }
    });

    if (targetElements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            onHeadingsVisible?.(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      },
    );

    targetElements.forEach((el) => observerRef.current?.observe(el));
  }, [html, headings, onHeadingsReady, onHeadingsVisible, t]);

  useEffect(() => {
    initializeContent();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [initializeContent]);

  // ── Client-side navigation interception ───────────────────────────
  useEffect(() => {
    // SSR 守卫：导航拦截在服务端无意义
    if (typeof window === 'undefined') return;

    const container = contentRef.current;
    if (!container) return;

    function isInternalNavigationLink(anchor: HTMLAnchorElement): boolean {
      const href = anchor.getAttribute('href');
      if (!href) return false;

      if (anchor.getAttribute('target') === '_blank') return false;
      if (anchor.hasAttribute('download')) return false;
      if (href.startsWith('#')) return false;
      if (/^[a-z]+:/i.test(href) && !href.startsWith('http')) return false;

      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return false;
      }

      if (url.origin !== window.location.origin) return false;
      return true;
    }

    function handleClick(e: MouseEvent): void {
      let target: HTMLElement | null = e.target as HTMLElement;
      while (target && target !== container && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target || target.tagName !== 'A') return;

      const anchor = target as HTMLAnchorElement;

      if (!isInternalNavigationLink(anchor)) return;

      e.preventDefault();

      const href = anchor.getAttribute('href')!;
      const dest = new URL(href, window.location.origin);
      const to = dest.pathname + dest.search + dest.hash;

      navigate(to);
    }

    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [navigate, location]);

  // ── Render ─────────────────────────────────────────────────────────
  // SSR (renderToString):  使用 dangerouslySetInnerHTML 内联渲染 HTML。
  //                        useEffect 不执行，Mermaid 代码块原样保留。
  // CSR (浏览器):          使用 useEffect + 手动 innerHTML 仅在 html
  //                        实际变化时写入，保护 Mermaid SVG 不被 React
  //                        重渲染覆盖。

  if (typeof window === 'undefined') {
    // SSR path: inline the Markdown HTML so SSG output contains document content
    return (
      <article className="w-full max-w-none">
        {/* Document header — to be implemented separately */}
        <div
          ref={contentRef}
          className={PROSE_CLASS}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    );
  }

  // CSR path: useEffect handles innerHTML write (Mermaid-safe)
  return (
    <article className="w-full max-w-none">
      {/* Document header — to be implemented separately */}
      {/* <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {frontmatter.title}
        </h1>
        {frontmatter.description && (
          <p className="mt-3 text-lg text-muted-foreground">
            {frontmatter.description}
          </p>
        )}
      </header> */}
      <div
        ref={contentRef}
        className={PROSE_CLASS}
      />
    </article>
  );
}