import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import type { DocManifest, TocHeading } from '@/types/doc';

import { fetchDocManifest, docKeys } from '@/services/docService';
import { useIsMobile } from '@/hooks/use-mobile';
import { siteConfig } from '@/lib/siteConfig';

import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Header } from '@/components/Header';
import { DocSidebar } from '@/components/DocSidebar';
import { TocSidebar } from '@/components/TocSidebar';
import { Footer } from '@/components/Footer';

// ---------------------------------------------------------------------------
// DocContext – bridges DocPage (inside Outlet) with TocSidebar (in Layout)
// ---------------------------------------------------------------------------

interface DocContextValue {
  headings: TocHeading[];
  activeHeadingId: string;
  setHeadings: (headings: TocHeading[]) => void;
  setActiveHeadingId: (id: string) => void;
}

const DocContext = createContext<DocContextValue | null>(null);

export function useDocContext(): DocContextValue {
  const ctx = useContext(DocContext);
  if (!ctx) {
    throw new Error('useDocContext must be used within a Layout (DocContext.Provider).');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the current route matches `/:lang/*` and `lang` is
 * a supported locale (as defined in `siteConfig.locales`).
 */
function isDocRoute(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 2) return false;
  const lang = parts[0];
  return (siteConfig.locales as readonly string[]).includes(lang);
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function Layout(): React.ReactElement {
  const { pathname } = useLocation();
  const { lang } = useParams<{ lang?: string }>();
  const isMobile = useIsMobile();

  const onDocPage = isDocRoute(pathname);
  const currentLang = lang ?? siteConfig.defaultLocale;

  // ---- DocContext state (for TocSidebar) ----
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState('');

  const docContextValue = useMemo<DocContextValue>(
    () => ({
      headings,
      activeHeadingId,
      setHeadings,
      setActiveHeadingId,
    }),
    [headings, activeHeadingId],
  );

  // ---- TanStack Query: fetch manifest only on doc pages ----
  const {
    data: manifest,
    isLoading: manifestLoading,
    isError: manifestError,
  } = useQuery({
    queryKey: docKeys.manifest(currentLang),
    queryFn: () => fetchDocManifest(currentLang),
    enabled: onDocPage,
    staleTime: 5 * 60 * 1000, // 5 min
  });

  // ---- Helper: scroll to heading ----
  const handleHeadingClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <DocContext.Provider value={docContextValue}>
      <SidebarProvider defaultOpen={onDocPage}>
        <div className="flex min-h-screen flex-col w-full">
          {/* ---- Header ---- */}
          <Header showSidebarTrigger={onDocPage} />

          {/* ---- Body ---- */}
          <div className="flex flex-1">
            {/* Doc sidebar – only on doc pages, only when NOT on mobile (shadcn handles mobile sheet) */}
            {onDocPage && !isMobile && (
              <div className="shrink-0">
                {manifestLoading && (
                  <div className="flex h-full w-56 items-start justify-center pt-8">
                    <span className="text-sm text-muted-foreground">
                      Loading…
                    </span>
                  </div>
                )}
                {manifestError && (
                  <div className="flex h-full w-56 items-start justify-center pt-8">
                    <span className="text-sm text-destructive">
                      Failed to load menu.
                    </span>
                  </div>
                )}
                {manifest && (
                  <DocSidebar
                    manifest={manifest}
                    currentPath={pathname}
                  />
                )}
              </div>
            )}

            {/* On mobile, shadcn SidebarProvider + SidebarTrigger handles the sheet.
                DocSidebar is already rendered inside the Sheet by shadcn's Sidebar component
                when it detects isMobile. So we need to render it "inside" the provider but
                the Sidebar component itself handles the mobile sheet. We render DocSidebar
                unconditionally (shadcn Sidebar's mobile logic wraps it in a Sheet). */}

            {onDocPage && isMobile && manifest && (
              <DocSidebar manifest={manifest} currentPath={pathname} />
            )}

            {/* Main content area */}
            <SidebarInset>
              <div className="mx-auto flex w-full flex-col flex-1 xl:flex-row xl:gap-4 max-w-(--breakpoint-2xl) xl:max-w-[calc(var(--breakpoint-2xl)+15rem)]">
                <main className="flex-1 min-w-0 p-4">
                  <Outlet />
                </main>

                {/* TOC sidebar – only on doc pages, hidden on mobile */}
                {onDocPage && !isMobile && (
                  <TocSidebar
                    headings={headings}
                    activeId={activeHeadingId}
                    onHeadingClick={handleHeadingClick}
                  />
                )}
              </div>
            </SidebarInset>
          </div>

          {/* ---- Footer ---- */}
          <Footer />
        </div>
      </SidebarProvider>
    </DocContext.Provider>
  );
}