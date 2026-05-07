import { useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDocPage, docKeys } from '@/services/docService';
import type { DocPageData } from '@/types/doc';
import type { HydrationData, HomeHydrationData } from '@/types/hydration';

/**
 * Consume hydration data injected by the build step into the static HTML page.
 *
 * The data is only available on the **first** page load (SSG output) and is
 * consumed once then cleared so subsequent client-side navigations use the
 * normal TanStack Query path.
 */
function consumeHydrationData(): HydrationData | HomeHydrationData | undefined {
  if (typeof window === 'undefined') return undefined;
  const data = window.__HYDRATION_DATA__;
  if (data) {
    // Consume once – delete so it's never reused for another page.
    window.__HYDRATION_DATA__ = undefined;
  }
  return data;
}

export interface UseDocDataResult {
  data: DocPageData | undefined;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook that returns the resolved `DocPageData` for a given language and path.
 *
 * On the initial page load (SSG scenario) it checks `window.__HYDRATION_DATA__`
 * and uses that as the initial query data so there is zero layout shift. On
 * subsequent client-side navigations the hook falls back to the virtual-module
 * import provided by `fetchDocPage`.
 */
export function useDocData(
  lang: string,
  path: string,
): UseDocDataResult {
  const hydrated = useRef(consumeHydrationData());

  const queryFn = useCallback(async (): Promise<DocPageData> => {
    return fetchDocPage(lang, path);
  }, [lang, path]);

  // Construct the full path as it appears in HydrationData.path:
  //   - "en"                   for path === 'index' (language home page)
  //   - "en/guide/intro"       for path === 'guide/intro' (document page)
  const fullPath = path === 'index' ? lang : `${lang}/${path}`;

  const { data, isLoading, error } = useQuery<DocPageData>({
    queryKey: docKeys.doc(lang, path),
    queryFn,
    // If we have hydration data for this exact page, use it as initial data.
    // HomeHydrationData lacks frontmatter/headings – only HydrationData is usable here.
    ...(hydrated.current &&
      'frontmatter' in hydrated.current &&
      hydrated.current.lang === lang &&
      hydrated.current.path === fullPath
        ? {
            initialData: {
              html: hydrated.current.html,
              frontmatter: {
                title: hydrated.current.frontmatter.title,
                description: hydrated.current.frontmatter.description,
                order: hydrated.current.frontmatter.order,
              },
              headings: hydrated.current.headings.map((h) => ({
                id: h.id,
                text: h.text,
                level: h.level,
              })),
              lang: hydrated.current.lang,
              // Use caller's `path` (resolvedPath format) to keep
              // DocPageData.path consistent with dev-mode responses.
              path,
              // Propagate prev/next navigation refs from hydration data
              prev: hydrated.current.prev,
              next: hydrated.current.next,
            } satisfies DocPageData,
          }
        : {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
  };
}