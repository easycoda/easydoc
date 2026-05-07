/** Supported locale codes */
export type Locale = 'en' | 'zh';

/** Map of locale to display name */
export type LocaleDisplayMap = Record<Locale, string>;

/** UI translation keys for static UI strings */
export interface UITranslations {
  'nav.home': string;
  'nav.docs': string;
  'nav.guide': string;
  'nav.api': string;
  'nav.examples': string;
  'nav.github': string;
  'search.placeholder': string;
  'search.empty': string;
  'theme.light': string;
  'theme.dark': string;
  'theme.system': string;
  'toc.title': string;
  'sidebar.toggle': string;
  'notfound.title': string;
  'notfound.description': string;
  'notfound.back': string;
  'home.hero.title': string;
  'home.hero.subtitle': string;
  'home.hero.cta': string;
  'home.hero.secondary': string;
  'home.features.title': string;
  [key: string]: string;
}

/** A map of all UI translations, keyed by locale */
export type TranslationMap = Record<Locale, UITranslations>;