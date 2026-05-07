import Fuse from 'fuse.js';
import type { SearchIndex, SearchIndexEntry } from '@/types/doc';

/**
 * Creates a configured Fuse.js search engine instance.
 *
 * Uses fuzzy search across title, text, and section fields
 * with a lenient threshold of 0.3 for forgiving matching.
 */
export function createSearchEngine(index: SearchIndex): Fuse<SearchIndexEntry> {
  return new Fuse(index, {
    keys: ['title', 'text', 'section'],
    threshold: 0.3,
    includeScore: true,
  });
}

/**
 * Executes a search query against the given engine and returns
 * results sorted by score (best match first).
 *
 * Returns an empty array for empty or whitespace-only queries.
 */
export function searchIndex(
  searchEngine: Fuse<SearchIndexEntry>,
  query: string
): SearchIndexEntry[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const results = searchEngine.search(trimmed);
  return results.map((result) => result.item);
}