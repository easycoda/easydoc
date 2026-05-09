import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { fetchSearchIndex, docKeys } from '@/services/docService';
import type { SearchIndex, SearchIndexEntry } from '@/types/doc';

export interface UseSearchResult {
  /** Execute a fuzzy search against the documentation index. */
  search: (query: string) => SearchIndexEntry[];
  /** Whether the search index is still loading. */
  isLoading: boolean;
  /** Error if the index failed to load. */
  error: Error | null;
}

/**
 * Loads the pre-built search index and initialises a Fuse.js instance for
 * client-side fuzzy searching.
 *
 * The search index is fetched once (`staleTime: Infinity`) and reused across
 * the entire application session.
 */
export function useSearch(lang: string): UseSearchResult {
  const {
    data: searchIndex,
    isLoading,
    error,
  } = useQuery<SearchIndex>({
    queryKey: docKeys.searchIndex(),
    queryFn: () => fetchSearchIndex(lang),
    staleTime: Infinity,
  });

  const fuse = useMemo(() => {
    if (!searchIndex || searchIndex.length === 0) return null;
    return new Fuse<SearchIndexEntry>(searchIndex, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'text', weight: 0.3 },
        { name: 'section', weight: 0.2 },
      ],
      includeScore: true,
      threshold: 0.4,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
  }, [searchIndex]);

  const search = useCallback(
    (query: string): SearchIndexEntry[] => {
      const trimmed = query.trim();
      if (!trimmed || !fuse) return [];

      return fuse.search(trimmed).map((result) => result.item);
    },
    [fuse],
  );

  return {
    search,
    isLoading,
    error: error as Error | null,
  };
}