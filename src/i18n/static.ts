import type { Locale, UITranslations } from '../types/i18n';
import type { SiteConfig } from '../types/config';
import en from './en';
import zh from './zh';

/** Map of all UI translations, keyed by locale (static, no hooks) */
const translations: Record<Locale, UITranslations> = { en, zh };

/**
 * Returns a flat `Record<string, string>` of UI translations for the given
 * locale. Falls back to English (`en`) when the requested locale is not
 * available.
 *
 * Designed for build-time / SSG consumption where React hooks are unavailable.
 */
export function getTranslations(lang: string): Record<string, string> {
  const locale = (lang in translations ? lang : 'en') as Locale;
  return translations[locale] as unknown as Record<string, string>;
}

/**
 * Returns the site title for SEO / meta-tag usage.
 *
 * Prefers `siteConfig.title` when set; otherwise falls back to the i18n key
 * `home.title` for the given locale.
 */
export function getSiteTitle(lang: string, siteConfig: SiteConfig): string {
  if (siteConfig.title) {
    return siteConfig.title;
  }
  return getTranslations(lang)['home.title'] ?? 'EasyCoda Documentation';
}

/**
 * Returns the site description for SEO / meta-tag usage.
 *
 * Prefers `siteConfig.description` when set; otherwise falls back to the i18n
 * key `home.description` for the given locale.
 */
export function getSiteDescription(lang: string, siteConfig: SiteConfig): string {
  if (siteConfig.description) {
    return siteConfig.description;
  }
  return getTranslations(lang)['home.description'] ?? '';
}

export { translations };
export type { Locale, UITranslations };