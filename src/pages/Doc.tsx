import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/index';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Home } from 'lucide-react';
import { useDocData } from '@/hooks/useDocData';
import { DocContent } from '@/components/DocContent';
import { DocNav } from '@/components/DocNav';
import { useDocContext } from '@/components/Layout';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { siteConfig } from '@/lib/siteConfig';
/**
 * DocPage — the main documentation page component.
 *
 * Extracts `lang` and `*` (splat) from `useParams()`. Uses `useDocData` to
 * fetch the compiled HTML and frontmatter, then renders:
 *
 * - Loading: skeleton placeholders
 * - Error / Not Found: inline 404-style message with a link home
 * - Success: the full `DocContent` with headings-driven TOC integration
 *
 * Headings and active-heading callbacks are forwarded to the parent `Layout`
 * via `DocContext` so `TocSidebar` can consume them.
 */
export function DocPage(): React.ReactElement {
  const t = useTranslation();
  const { lang, '*': splat } = useParams<{ lang: string; '*': string }>();

  // Fall back to 'index' when no splat is present (language-level index page
  // reached via /:lang with no trailing path).
  const resolvedPath = splat || 'index';
  const resolvedLang = lang ?? 'en';

  const { data, isLoading, error } = useDocData(resolvedLang, resolvedPath);
  // ------------------------------------------------------------------
  // Document title — set browser tab title
  // Falls back to siteConfig.title when doc data is not yet available
  // or when frontmatter.title is missing.
  // ------------------------------------------------------------------
  const docTitle = data?.frontmatter?.title || siteConfig.title;
  useDocumentTitle(docTitle);

  // ------------------------------------------------------------------
  // Heading / TOC integration via DocContext (set by Layout)
  // ------------------------------------------------------------------
  const { setHeadings, setActiveHeadingId } = useDocContext();

  // Headings are pushed to context by DocContent via onHeadingsReady and
  // onHeadingsVisible callbacks. TocSidebar reads them from context and
  // renders the active heading highlight.

  // ------------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------------

  if (isLoading) {
    return (
      <main className="flex-1 p-4">
        {/* Title skeleton */}
        <div className="mb-8 border-b border-border pb-6">
          <Skeleton className="mb-2 h-9 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>

        {/* Content area skeletons */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />

          {/* Simulated heading */}
          <div className="pt-4">
            <Skeleton className="mb-3 h-7 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Another simulated heading */}
          <div className="pt-4">
            <Skeleton className="mb-3 h-7 w-2/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------------
  // Error / Not Found state
  // ------------------------------------------------------------------

  if (error || !data) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-4 text-8xl font-extrabold tracking-tight text-primary">
            404
          </h1>
          <h2 className="mb-2 text-2xl font-semibold text-foreground">
            {t['notfound.title']}
          </h2>
          <p className="mb-2 max-w-md text-muted-foreground">
            {t['doc.notFound']}
          </p>
          {error && (
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              {error.message}
            </p>
          )}
          <Button asChild size="lg">
            <Link to="/">
              <Home className="size-4" />
              {t['notfound.back']}
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  // ------------------------------------------------------------------
  // Success state
  // ------------------------------------------------------------------

  const { prev, next } = data;

  return (
    <main className="flex-1 p-4">
      <DocContent
        html={data.html}
        frontmatter={data.frontmatter}
        headings={data.headings}
        onHeadingsReady={setHeadings}
        onHeadingsVisible={setActiveHeadingId}
      />
      <DocNav prev={prev ?? null} next={next ?? null} />
    </main>
  );
}

export default DocPage;