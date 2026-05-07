import type { SeoMeta } from '../types/seo';
import type { SiteConfig } from '../types/config';

// ---------------------------------------------------------------------------
// 1. escapeHtml
// ---------------------------------------------------------------------------

/**
 * HTML-escape a string.
 * Replaces &, <, >, ", ' with their corresponding HTML entities.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// 2. buildSeoMetaString
// ---------------------------------------------------------------------------

/**
 * Generates the full SEO meta tag HTML string to be injected into `<head>`.
 */
export function buildSeoMetaString(meta: SeoMeta): string {
  const lines: string[] = [];

  lines.push(`<title>${escapeHtml(meta.title)}</title>`);
  lines.push(
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  );
  lines.push(
    `<meta property="og:title" content="${escapeHtml(meta.ogTitle)}" />`,
  );
  lines.push(
    `<meta property="og:description" content="${escapeHtml(meta.ogDescription)}" />`,
  );
  lines.push(`<meta property="og:type" content="${escapeHtml(meta.ogType)}" />`);
  lines.push(
    `<meta property="og:url" content="${escapeHtml(meta.ogUrl)}" />`,
  );
  if (meta.ogImage) {
    lines.push(
      `<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`,
    );
  }
  lines.push(
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// 3. buildHomeSeoMeta
// ---------------------------------------------------------------------------

/**
 * Builds a `SeoMeta` object for a home page in the given locale.
 */
export function buildHomeSeoMeta(
  lang: string,
  siteConfig: SiteConfig,
  translations: Record<string, string>,
): SeoMeta {
  const title =
    translations['home.title'] ||
    siteConfig.title ||
    'EasyDoc Documentation';
  const description =
    translations['home.description'] || siteConfig.description || '';

  const canonical = siteConfig.baseUrl
    ? `${siteConfig.baseUrl}`
    : `/${lang}`;

  return {
    title,
    description,
    canonical,
    ogType: 'website',
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonical,
    ogImage: (siteConfig as SiteConfig & { ogImage?: string }).ogImage,
    lang,
  };
}

