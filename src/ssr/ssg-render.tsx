import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider } from '@/components/ui/sidebar';

import { SsgLayout } from './ssg-layout';
import { DocContent } from '@/components/DocContent';
import { DocNav } from '@/components/DocNav';
import { HeroSection } from '@/components/HeroSection';
import { FeatureCards } from '@/components/FeatureCards';

import { docKeys } from '@/services/docService';
import { useAppStore } from '@/store/appStore';

import type { SsgPageEntry, SsgRenderContext } from '@/types/ssg';
import type { DocManifest } from '@/types/doc';
import type { SiteConfig } from '@/types/config';
import type { HydrationData } from '@/types/hydration';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a fresh QueryClient and pre-fill it with manifest + doc data so that
 * any useQuery() calls inside the React tree (e.g. Layout descendants) resolve
 * synchronously from the cache without triggering network requests.
 */
function createPreFilledQueryClient(
  lang: string,
  manifest: DocManifest,
  entry: SsgPageEntry,
): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent any automatic refetch / retry during SSR
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });

  // Pre-fill manifest so useQuery({ queryKey: docKeys.manifest(lang) }) hits
  // cache immediately.
  client.setQueryData(docKeys.manifest(lang), manifest);

  // Pre-fill the document page data.
  client.setQueryData(docKeys.doc(lang, entry.docPath), {
    html: entry.html,
    frontmatter: entry.frontmatter,
    headings: entry.headings,
    lang: entry.lang,
    path: entry.docPath,
    prev: undefined,
    next: undefined,
  });

  return client;
}

/**
 * Set the Zustand app store locale before rendering so that components that
 * read `useAppStore().locale` (e.g. HeroSection, Header) pick up the correct
 * language during SSR.
 */
function setSsrLocale(lang: string): void {
  const state = useAppStore.getState();
  if (state.locale !== lang) {
    state.setLocale(lang as 'en' | 'zh');
  }
}

// ---------------------------------------------------------------------------
// renderDocPageToString
// ---------------------------------------------------------------------------

/**
 * Render a documentation page to a complete HTML string suitable for
 * injection into the SSG index.html template.
 *
 * @param entry       - Pre-compiled page data (HTML, frontmatter, headings)
 * @param manifest    - Full doc navigation manifest for the current language
 * @param translations - UI translation dictionary
 * @param siteConfig  - Global site configuration
 * @param currentPath - Full request path, e.g. "/en/guide/getting-started"
 * @param hydrationData - Data to embed as window.__HYDRATION_DATA__
 */
export function renderDocPageToString(
  entry: SsgPageEntry,
  manifest: DocManifest,
  translations: Record<string, string>,
  siteConfig: SiteConfig,
  currentPath: string,
  hydrationData: HydrationData,
): string {
  // 1. Prepare locale-dependent state
  setSsrLocale(entry.lang);

  // 2. Build QueryClient with pre-filled data
  const queryClient = createPreFilledQueryClient(entry.lang, manifest, entry);

  // 3. Construct render context
  const context: SsgRenderContext = {
    lang: entry.lang,
    currentPath,
    onDocPage: true,
    manifest,
    headings: entry.headings,
    translations,
    siteConfig,
  };

  // 4. Assemble the React element tree and render
  return renderToString(
    <StaticRouter location={currentPath}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" disableTransitionOnChange={false}>
          <TooltipProvider delayDuration={0}>
            <SidebarProvider defaultOpen={true}>
              <SsgLayout context={context}>
                <DocContent
                  html={entry.html}
                  frontmatter={entry.frontmatter}
                  headings={entry.headings}
                />
                {hydrationData.prev || hydrationData.next ? (
                  <DocNav
                    prev={hydrationData.prev ?? null}
                    next={hydrationData.next ?? null}
                  />
                ) : null}
              </SsgLayout>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StaticRouter>,
  );
}

// ---------------------------------------------------------------------------
// renderHomePageToString
// ---------------------------------------------------------------------------

/**
 * Render the home / landing page to a complete HTML string.
 *
 * @param homeHtml    - Pre-compiled home page HTML (from HomeHydrationData)
 * @param translations - UI translation dictionary
 * @param siteConfig  - Global site configuration
 * @param lang        - Current language code, e.g. "en"
 */
export function renderHomePageToString(
  homeHtml: string,
  translations: Record<string, string>,
  siteConfig: SiteConfig,
  lang: string,
): string {
  // 1. Prepare locale-dependent state
  setSsrLocale(lang);

  // 2. Create an empty QueryClient (home page has no async data dependencies
  //    that need pre-filling; HeroSection / FeatureCards are pure static).
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });

  // 3. Build the home page path
  const currentPath = `/${lang}`;

  // 4. Construct render context
  const context: SsgRenderContext = {
    lang,
    currentPath,
    onDocPage: false,
    // No manifest or headings on the home page
    translations,
    siteConfig,
  };

  // 5. Assemble the React element tree and render.
  //    Note: `homeHtml` is intentionally unused within the component tree
  //    itself — it represents pre-rendered Markdown content for the home page
  //    that is injected into the template separately (e.g. as SEO-friendly
  //    content or hydration payload).  The visual landing page is entirely
  //    composed of HeroSection + FeatureCards React components.
  void homeHtml;

  return renderToString(
    <StaticRouter location={currentPath}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" disableTransitionOnChange={false}>
          <TooltipProvider delayDuration={0}>
            <SidebarProvider defaultOpen={false}>
              <SsgLayout context={context}>
                <HeroSection />
                <FeatureCards />
              </SsgLayout>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StaticRouter>,
  );
}