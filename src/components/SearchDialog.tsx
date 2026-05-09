import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileTextIcon } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { useSearch } from '@/hooks/useSearch';
import type { SearchIndexEntry } from '@/types/doc';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SearchDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Called when the dialog's open state should change (e.g. on close). */
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Groups search results by their `lang` field (e.g. "en", "zh").
 *
 * Returns a `Map<string, SearchIndexEntry[]>` where keys are language codes
 * and values are the matching entries for that language, preserving the
 * original result order within each group.
 */
function groupByLang(entries: SearchIndexEntry[]): Map<string, SearchIndexEntry[]> {
  const groups = new Map<string, SearchIndexEntry[]>();
  for (const entry of entries) {
    const existing = groups.get(entry.lang);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(entry.lang, [entry]);
    }
  }
  return groups;
}

/** Human-readable label for a language code. */
const LANG_LABELS: Record<string, string> = {
  en: 'English',
  zh: '中文',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A command-palette-style search dialog for documentation.
 *
 * On mount (when `open` transitions to `true`) the `useSearch` hook fetches
 * the pre-built search index. As the user types in the `CommandInput`, results
 * are filtered using Fuse.js fuzzy search and displayed grouped by language.
 *
 * Selecting a result navigates to that document's path (via `useNavigate`) and
 * closes the dialog.
 */
export function SearchDialog({
  open,
  onOpenChange,
}: SearchDialogProps): React.ReactElement {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang?: string }>();
  const currentLang = lang ?? siteConfig.defaultLocale;
  const { search, isLoading, error } = useSearch(currentLang, { enabled: open });

  const [query, setQuery] = useState('');

  // --- Derived state -------------------------------------------------------
  const results = useMemo(() => search(query), [search, query]);
  const grouped = useMemo(() => groupByLang(results), [results]);

  // --- Handlers ------------------------------------------------------------
  const handleSelect = useCallback(
    (entry: SearchIndexEntry) => {
      navigate(entry.path);
      onOpenChange(false);
    },
    [navigate, onOpenChange],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      // Clear the query whenever the dialog closes so it's fresh next time.
      if (!next) setQuery('');
      onOpenChange(next);
    },
    [onOpenChange],
  );

  // --- Loading / Error states -----------------------------------------------
  const body = (() => {
    if (isLoading) {
      return (
        <CommandList>
          <p className="py-6 text-center text-sm text-muted-foreground">
            Loading search index…
          </p>
        </CommandList>
      );
    }

    if (error) {
      return (
        <CommandList>
          <p className="py-6 text-center text-sm text-destructive">
            Failed to load search index.
          </p>
        </CommandList>
      );
    }

    if (results.length === 0 && query.trim().length > 0) {
      return <CommandEmpty>No results found.</CommandEmpty>;
    }

    if (results.length === 0) {
      return (
        <CommandList>
          <p className="py-6 text-center text-sm text-muted-foreground">
            Type to search documentation…
          </p>
        </CommandList>
      );
    }

    return (
      <CommandList>
        {[...grouped.entries()].map(([lang, entries]) => (
          <CommandGroup
            key={lang}
            heading={LANG_LABELS[lang] ?? lang}
          >
            {entries.map((entry) => (
              <CommandItem
                key={`${entry.lang}:${entry.path}`}
                value={`${entry.title} ${entry.section ?? ''}`}
                onSelect={() => handleSelect(entry)}
                className="flex items-center gap-2"
              >
                <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{entry.title}</span>
                  {entry.section && (
                    <span className="truncate text-xs text-muted-foreground">
                      {entry.section}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    );
  })();

  // --- JSX ----------------------------------------------------------------
  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Search Documentation"
      description="Search across all documentation pages. Use arrow keys to navigate and Enter to select."
    >
      <CommandInput
        placeholder="Search documentation…"
        value={query}
        onValueChange={setQuery}
      />
      {body}
    </CommandDialog>
  );
}