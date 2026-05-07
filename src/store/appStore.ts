import { create } from 'zustand';
import type { AppState } from '@/types/store';
import type { Locale } from '@/types/i18n';

const STORAGE_KEY = 'easydoc-locale';

/** Read initial locale from localStorage, falling back to 'en' */
function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') {
      return stored;
    }
  } catch {
    // localStorage unavailable (SSR or privacy mode) — use default
  }
  return 'en';
}

export const useAppStore = create<AppState>()((set) => ({
  locale: getInitialLocale(),

  setLocale: (locale: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // localStorage unavailable — skip persistence
    }
    set({ locale });
  },
}));