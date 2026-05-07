import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { NavLink } from '@/types/config';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MobileNavListProps {
  /** Navigation items to render (supports nested children). */
  items: NavLink[];
  /** Current route path, used to highlight the active link. */
  currentPath: string;
  /** Called whenever a link is clicked, so the parent Sheet can close. */
  onLinkClick: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A collapsible nested navigation list designed for mobile Sheet menus.
 *
 * Behaviour:
 * - Items **with** `children` render as a `Collapsible` whose open/closed
 *   state is toggled by tapping the parent label.
 * - Items **without** `children` render as a plain link (`<Link>` for
 *   internal, `<a>` for external). Clicking any link calls `onLinkClick`.
 * - External links open in a new tab with `rel="noopener noreferrer"`.
 * - Parent labels are translated via `useT(key)`. Child labels are
 *   displayed as-is (literal text).
 */
export function MobileNavList({
  items,
  currentPath,
  onLinkClick,
}: MobileNavListProps): React.ReactElement {
  return (
    <nav className="flex flex-col gap-1 py-2">
      {items.map((item) => (
        <MobileNavItem
          key={item.label}
          item={item}
          currentPath={currentPath}
          onLinkClick={onLinkClick}
        />
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Internal: single item renderer
// ---------------------------------------------------------------------------

interface MobileNavItemProps {
  item: NavLink;
  currentPath: string;
  onLinkClick: () => void;
}

function MobileNavItem({
  item,
  currentPath,
  onLinkClick,
}: MobileNavItemProps): React.ReactElement {
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <CollapsibleParentItem
        item={item}
        currentPath={currentPath}
        onLinkClick={onLinkClick}
      />
    );
  }

  return (
    <LeafNavItem
      item={item}
      currentPath={currentPath}
      onLinkClick={onLinkClick}
    />
  );
}

// ---------------------------------------------------------------------------
// Collapsible parent item (has children)
// ---------------------------------------------------------------------------

function CollapsibleParentItem({
  item,
  currentPath,
  onLinkClick,
}: MobileNavItemProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const tLabel = useT(item.label);

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        onClick={toggle}
        className={cn(
          'flex w-full items-center justify-between rounded-md px-3 py-2.5',
          'text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <span>{tLabel}</span>
        <ChevronRight
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-90',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="ml-4 border-l border-border pl-2">
          {item.children!.map((child) => (
            <LeafNavItem
              key={`${child.label}-${child.path ?? ''}`}
              item={child}
              currentPath={currentPath}
              onLinkClick={onLinkClick}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Leaf item (no children) — plain link
// ---------------------------------------------------------------------------

function LeafNavItem({
  item,
  currentPath,
  onLinkClick,
}: MobileNavItemProps): React.ReactElement {
  const navPath = item.path ?? '#';
  const isExternal = item.external === true;
  const isActive = !isExternal && currentPath === navPath;

  const linkClasses = cn(
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
    'hover:bg-accent hover:text-accent-foreground',
    isActive && 'bg-accent text-accent-foreground',
  );

  if (isExternal) {
    return (
      <a
        href={navPath}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
        onClick={onLinkClick}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link to={navPath} className={linkClasses} onClick={onLinkClick}>
      {item.label}
    </Link>
  );
}