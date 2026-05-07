import { useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Globe } from 'lucide-react';

import { useAppStore } from '@/store/appStore';
import { siteConfig } from '@/lib/siteConfig';
import type { Locale } from '@/types/i18n';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

/** Display names for each supported locale */
const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
};

/**
 * Builds the new path by replacing the current language segment with the target locale.
 * Preserves everything after the language segment (doc path, query string, hash).
 */
function buildSwitchedPath(
  currentPath: string,
  oldLang: string | undefined,
  newLang: Locale,
): string {
  if (!oldLang) {
    // No language segment in URL — prepend the new locale
    return `/${newLang}${currentPath}`;
  }

  // Replace the first occurrence of `/${oldLang}` with `/${newLang}`
  // This preserves any subsequent path segments (e.g. /en/guide/getting-started → /zh/guide/getting-started)
  const prefix = `/${oldLang}`;
  if (currentPath.startsWith(prefix)) {
    return `/${newLang}${currentPath.slice(prefix.length)}`;
  }

  // If the oldLang is not at the start of the path (unexpected),
  // fall back to replacing it anywhere
  return currentPath.replace(new RegExp(`/${oldLang}(/|$)`, 'g'), `/${newLang}$1`);
}

export function LanguageSwitcher(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);

  /** The language segment from the current URL (e.g. 'en' or 'zh') */
  const currentLang = (params.lang as Locale | undefined) ?? locale;

  const currentLabel = useMemo(
    () => LOCALE_LABELS[currentLang] ?? LOCALE_LABELS.en,
    [currentLang],
  );

  const handleSelectLocale = useCallback(
    (targetLocale: Locale) => {
      if (targetLocale === currentLang) return;

      setLocale(targetLocale);
      const newPath = buildSwitchedPath(
        location.pathname,
        params.lang,
        targetLocale,
      );
      navigate(newPath + location.search + location.hash, { replace: true });
    },
    [currentLang, location.pathname, location.search, location.hash, params.lang, setLocale, navigate],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Switch language">
          <Globe className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        {siteConfig.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleSelectLocale(loc)}
            className={loc === currentLang ? 'font-semibold' : undefined}
          >
            {LOCALE_LABELS[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}