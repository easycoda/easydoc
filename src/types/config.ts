import type { Locale } from './i18n';

/** Site-level configuration */
export interface SiteConfig {
  title: string;
  description: string;
  logo?: string;
  baseUrl?: string;
  locales: Locale[];
  defaultLocale: Locale;
  /** Navigation links shown in the header. Supports nested children. */
  nav: NavLink[];
  /** Footer links */
  footer: FooterConfig;
  /** Open Graph image path (e.g. '/logo.svg'). Prepended with baseUrl when used in meta tags. */
  ogImage?: string;
  /** Social / external links */
  socialLinks?: SocialLink[];
}

/**
 * A navigation link entry.
 * - When `children` is present, this is a parent menu item (dropdown on desktop,
 *   collapsible on mobile). The `path` is optional in this case.
 * - When `children` is absent, this is a leaf link.
 * - `external`: if true, opens in new tab with rel="noopener noreferrer".
 * - `label`: i18n translation key for parent items (e.g. "nav.guide").
 *   For child items, `label` is the literal display text.
 */
export interface NavLink {
  label: string;
  path?: string;
  external?: boolean;
  children?: NavLink[];
}

export interface FooterConfig {
  copyright: string;
  links: FooterLink[];
}

export interface FooterLink {
  text: string;
  link: string;
}

export interface SocialLink {
  /** Lucide icon name */
  icon: string;
  link: string;
  label: string;
}