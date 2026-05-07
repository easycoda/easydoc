import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { fetchDocManifest, docKeys } from '@/services/docService';
import type { DocNavItem } from '@/types/doc';

/**
 * Recursively find the first navigable doc path from a nav tree.
 * Returns the path of the first leaf (or the first node with a path if no children).
 */
function findFirstDocPath(nav: DocNavItem[]): string | null {
  if (!nav || nav.length === 0) return null;
  const sorted = [...nav].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const item of sorted) {
    if (item.children && item.children.length > 0) {
      const childPath = findFirstDocPath(item.children);
      if (childPath) return childPath;
    }
    return item.path;
  }
  return null;
}

/**
 * LangIndexPage — language-level index page.
 *
 * Extracts `lang` from the URL params, validates it against the supported
 * locales defined in `siteConfig`, and redirects to the first document
 * available for that language (fetched from the virtual doc manifest).
 *
 * If the language is not supported, redirects to the default locale (`/en`).
 */
export function LangIndexPage(): React.ReactElement {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();

  // Validate the language param — redirect if unsupported
  const isValidLang =
    !!lang && (siteConfig.locales as readonly string[]).includes(lang);

  useEffect(() => {
    if (!isValidLang) {
      navigate(`/${siteConfig.defaultLocale}`, { replace: true });
    }
  }, [isValidLang, navigate]);

  // Only fetch the manifest if the language is valid
  const { data: manifest, isLoading, isError, error } = useQuery({
    queryKey: docKeys.manifest(lang!),
    queryFn: () => fetchDocManifest(lang!),
    enabled: isValidLang && !!lang,
    staleTime: 5 * 60 * 1000, // 5 min — manifests rarely change
  });

  // On manifest load, redirect to the first doc
  useEffect(() => {
    if (manifest?.nav) {
      const firstPath = findFirstDocPath(manifest.nav);
      if (firstPath) {
        navigate(firstPath, { replace: true });
      }
    }
  }, [manifest, navigate]);

  // Invalid lang — show nothing, the redirect effect will fire
  if (!isValidLang) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  // Error state
  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <p className="mb-4 text-muted-foreground">
            Failed to load documentation for language &quot;{lang}&quot;.
          </p>
          <p className="text-sm text-muted-foreground">
            {(error as Error)?.message}
          </p>
        </div>
      </main>
    );
  }

  // Success but no nav items — edge case
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">
        No documentation found for &quot;{lang}&quot;.
      </p>
    </main>
  );
}

export default LangIndexPage;