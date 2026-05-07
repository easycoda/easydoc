import { useEffect, useCallback } from 'react';
import { SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Detect the user's platform so we show the right modifier key label
// ---------------------------------------------------------------------------

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SearchTriggerProps {
  /** Called when the user clicks the button or presses Ctrl+K / Cmd+K. */
  onOpen: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A button styled as a search bar that opens the search dialog.
 *
 * Renders:
 * - A magnifying glass icon
 * - "Search..." placeholder text
 * - A keyboard shortcut badge (⌘K on macOS, Ctrl+K elsewhere)
 *
 * Additionally registers a **global** `keydown` listener for Ctrl+K / Cmd+K
 * that triggers `onOpen`.
 */
export function SearchTrigger({ onOpen }: SearchTriggerProps): React.ReactElement {
  const os = isMac();

  // --- Global keyboard shortcut -------------------------------------------
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpen();
      }
    },
    [onOpen],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // --- Render -------------------------------------------------------------
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onOpen}
      className={cn(
        'relative h-9 md:w-full justify-start gap-2 px-2 text-sm font-normal text-muted-foreground',
        'md:pr-12',
      )}
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <span className="hidden md:inline-flex">Search...</span>
      <Kbd className="pointer-events-none absolute right-1.5 top-1/2 hidden -translate-y-1/2 select-none md:inline-flex">
        {os ? '⌘K' : 'Ctrl+K'}
      </Kbd>
    </Button>
  );
}