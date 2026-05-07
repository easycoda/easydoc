import type { UITranslations, Locale } from '@/types/i18n';
import { useAppStore } from '@/store/appStore';
import en from './en';
import zh from './zh';

/** Map of all UI translations, keyed by locale */
const translations: Record<Locale, UITranslations> = {
  en,
  zh,
};

/**
 * Returns the translation object for the currently active locale.
 * Reads locale from the Zustand appStore. Falls back to English.
 */
export function useTranslation(): UITranslations {
  const locale = useAppStore((state) => state.locale);
  return translations[locale] ?? translations.en;
}

/**
 * Returns a specific translation key for the current locale.
 * Convenience wrapper when you only need a single string.
 */
export function useT(key: string): string {
  const t = useTranslation();
  return t[key] ?? key;
}

export { translations };
export type { UITranslations, Locale };