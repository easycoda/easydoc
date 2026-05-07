import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { siteConfig } from '@/lib/siteConfig';
import { HomePage } from '@/pages/Home';
import type { Locale } from '@/types/i18n';

/**
 * LangHomePage — language-level home page.
 *
 * Extracts `lang` from the URL params, validates it against the supported
 * locales defined in `siteConfig`, syncs the app locale via the store,
 * and renders the HomePage component.
 *
 * If the language is not supported, redirects to the default locale (`/en`).
 */
export function LangHomePage(): React.ReactElement {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();

  // Validate the language param
  const isValidLang =
    !!lang && (siteConfig.locales as readonly string[]).includes(lang);

  useEffect(() => {
    if (isValidLang) {
      // Sync the app locale so the rest of the UI reflects the URL lang
      useAppStore.getState().setLocale(lang as Locale);
    } else {
      // Redirect unsupported languages to the default locale
      navigate(`/${siteConfig.defaultLocale}`, { replace: true });
    }
  }, [lang, isValidLang, navigate]);

  // Invalid lang — show a centered spinner while the redirect effect fires
  if (!isValidLang) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  // Valid lang — render the home page
  return <HomePage />;
}