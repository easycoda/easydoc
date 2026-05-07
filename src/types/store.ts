import type { Locale } from './i18n';

/** Zustand store for i18n / app state */
export interface AppState {
  /** Currently active locale */
  locale: Locale;
  /** Set the active locale */
  setLocale: (locale: Locale) => void;
}