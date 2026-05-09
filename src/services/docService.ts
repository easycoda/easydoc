import { siteConfig } from '@/lib/siteConfig';
import type { DocPageData, DocManifest, SearchIndex } from '@/types/doc';
import type { HydrationData, HomeHydrationData } from '@/types/hydration';
import { siteConfig } from '@/lib/siteConfig';
// ---------------------------------------------------------------------------
// TanStack Query key factory
// ---------------------------------------------------------------------------

/**
 * Stable query keys consumed by TanStack Query hooks.
 *
 * Usage:
 *   useQuery({ queryKey: docKeys.doc(lang, path), queryFn: ... })
 */
export const docKeys = {
  /** Key for a single document page: ['doc', lang, path] */
  doc: (lang: string, path: string) =>
    ['doc', lang, path] as const,

  /** Key for a language manifest: ['manifest', lang] */
  manifest: (lang: string) =>
    ['manifest', lang] as const,

  /** Key for the search index: ['search-index'] */
  searchIndex: () =>
    ['search-index'] as const,
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the JSON value of `window.__HYDRATION_DATA__` from an SSG-generated
 * static HTML page using brace-counting instead of a fragile regex.
 *
 * The regex `/window\.__HYDRATION_DATA__\s*=\s*(\{.*?\});/s` fails when the
 * JSON object contains nested braces (e.g. `frontmatter: {}`, `headings: [{}]`,
 * `prev: {}` / `next: {}`) because the non-greedy `.*?` stops at the first `}`.
 *
 * This function manually walks characters while tracking:
 * - Nesting depth (`{` → +1, `}` → −1); extraction completes at `depth === 0`.
 * - String-literal state so braces inside quotes are ignored.
 * - Backslash-escape state so `\"` does not toggle string mode.
 */
function extractHydrationData(html: string): string | null {
  const marker = 'window.__HYDRATION_DATA__';
  const startIdx = html.indexOf(marker);
  if (startIdx === -1) return null;

  // Find the opening brace after the marker
  const braceStart = html.indexOf('{', startIdx + marker.length);
  if (braceStart === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = braceStart; i < html.length; i++) {
    const ch = html[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === '\\') {
      escape = true;
      continue;
    }

    if (ch === '"' && !escape) {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        return html.substring(braceStart, i + 1);
      }
    }
  }

  return null; // unbalanced braces
}

// ---------------------------------------------------------------------------
// Data-fetching service functions
// ---------------------------------------------------------------------------

/**
 * Fetch a single doc page.
 *
 * In **dev mode** the Vite plugin serves compiled Markdown data via
 * `GET /api/doc/<lang>/<path>`. Using `fetch()` avoids CORS issues when
 * the dev server is accessed through an external ingress (e.g. ngrok).
 *
 * In **production** this fetches the SSG-generated static HTML file,
 * extracts the `window.__HYDRATION_DATA__` JSON via brace-counting, and
 * maps it to a `DocPageData` structure.
 */
export async function fetchDocPage(
  lang: string,
  path: string,
): Promise<DocPageData> {
  // Dev: fetch JSON from the Vite middleware endpoint
  if (import.meta.env.DEV) {
    const url = `/api/doc/${lang}/${path}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch doc page: ${res.status} ${res.statusText}`,
      );
    }
    return (await res.json()) as DocPageData;
  }

  // Prod: fetch the SSG-generated static HTML and extract hydration data
  const htmlUrl =
    path === 'index'
      ? `${siteConfig.baseUrl}/${lang}/index.html`
      : `${siteConfig.baseUrl}/${lang}/${path}.html`;

  const res = await fetch(htmlUrl);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch doc page at ${htmlUrl}: ${res.status} ${res.statusText}`,
    );
  }

  const htmlText = await res.text();

  // Extract window.__HYDRATION_DATA__ = {...} from the HTML
  // Uses brace-counting to correctly handle nested JSON objects.
  const hydrationJson = extractHydrationData(htmlText);
  if (!hydrationJson) {
    throw new Error(`Hydration data not found in HTML for ${htmlUrl}`);
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(hydrationJson) as Record<string, unknown>;
  } catch (parseError) {
    throw new Error(
      `Failed to parse hydration data for ${htmlUrl}: ${(parseError as Error).message}`,
    );
  }

  // Map hydration data → DocPageData.
  // SSG emits two data shapes:
  //   • HydrationData     — doc pages, has `frontmatter`
  //   • HomeHydrationData — home page,  has NO `frontmatter`, only top-level title/description
  // Use the caller's `path` parameter (resolvedPath, without lang prefix) to
  // keep DocPageData.path consistent across dev and prod.
  if ('frontmatter' in parsed) {
    const data = parsed as unknown as HydrationData;
    return {
      html: data.html,
      frontmatter: {
        title: data.frontmatter.title,
        description: data.frontmatter.description,
        order: data.frontmatter.order,
      },
      headings: data.headings,
      lang: data.lang,
      path,
      prev: data.prev,
      next: data.next,
    };
  }

  // Home page shape — promote top-level title/description into frontmatter
  const data = parsed as unknown as HomeHydrationData;
  return {
    html: data.html,
    frontmatter: {
      title: data.title,
      description: data.description,
    },
    headings: [],
    lang: data.lang,
    path,
    prev: undefined,
    next: undefined,
  };
}

/**
 * Fetch the documentation manifest for a given language.
 *
 * In both **dev** and **production** this fetches the static
 * `manifest-<lang>.json` file. In dev mode the Vite plugin serves it
 * as a virtual module; in production `buildEnd` outputs it as a static
 * asset at `dist/manifest-<lang>.json`.
 */
export async function fetchDocManifest(
  lang: string,
): Promise<DocManifest> {
  const url = `${siteConfig.baseUrl}/manifest-${lang}.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch doc manifest: ${res.status} ${res.statusText}`,
    );
  }
  return (await res.json()) as DocManifest;
}

/**
 * Fetch the pre-built search index from the static JSON file emitted at build
 * time (`/search-index.json`).
 */
export async function fetchSearchIndex(lang: string): Promise<SearchIndex> {
  const res = await fetch(`${siteConfig.baseUrl}/search-index-${lang}.json`);
  if (!res.ok) {
    throw new Error(
      `Failed to load search index: ${res.status} ${res.statusText}`,
    );
  }
  return (await res.json()) as SearchIndex;
}