import { Link, useLocation } from 'react-router-dom';
import type { NavLink } from '@/types/config';
import { useT } from '@/i18n';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import {
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DesktopNavItemProps {
  /** The navigation item to render (may have children). */
  item: NavLink;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a single navigation item for desktop.
 *
 * - Parent items (with `children`): uses `NavigationMenuTrigger` +
 *   `NavigationMenuContent` to show a dropdown on hover. The trigger label
 *   is translated via `useT()`. The trigger is highlighted when any child
 *   route matches the current path.
 * - Leaf items without `children`:
 *   - Internal paths → `NavigationMenuLink` as a React Router `<Link>`.
 *   - External paths → `NavigationMenuLink` as an `<a>` with
 *     `target="_blank" rel="noopener noreferrer"`.
 *   The label is translated via `useT()`.
 */
export function DesktopNavItem({ item }: DesktopNavItemProps): React.ReactElement {
  const t = useT;
  const { pathname } = useLocation();
  const locale = useAppStore((state) => state.locale);

  // ------------------------------------------------------------------
  // Parent node — has children
  // ------------------------------------------------------------------
  if (item.children && item.children.length > 0) {
    const isActive = item.children.some(
      (child) => child.path && pathname === child.path,
    );

    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger
          className="text-accent-foreground group/btn cursor-pointer"
        >
          {t(item.label)}
          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[var(--color-zinc-500)] to-[var(--color-zinc-900)] transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300"></span>
        </NavigationMenuTrigger>
        <NavigationMenuContent >
          <ul className="grid w-56 gap-1">
            {item.children.map((child) => {
              const childPath = child.path ?? '#';
              const childActive = pathname === childPath;

              return (
                <li key={child.label}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={`/${locale}/${childPath}`}
                      className={cn(
                        'rounded-md px-2 py-3 text-sm transition-colors hover:bg-muted/50',
                        childActive &&
                          'text-accent-foreground font-medium',
                      )}
                    >
                      {t(child.label)}
                    </Link>

                  </NavigationMenuLink>
                </li>
              );
            })}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  // ------------------------------------------------------------------
  // Leaf node — no children
  // ------------------------------------------------------------------
  const leafPath = item.path ?? '#';
  const isExternal = item.external === true;

  if (isExternal) {
    return (
      <NavigationMenuItem>
        <NavigationMenuLink
          className={cn(navigationMenuTriggerStyle(), 'group/exlink')}
          href={leafPath}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t(item.label)}
          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[var(--color-zinc-500)] to-[var(--color-zinc-900)] transform scale-x-0 group-hover/exlink:scale-x-100 transition-transform duration-300"></span>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        className={cn(
          navigationMenuTriggerStyle(), 'group/link',
          pathname === leafPath && 'text-accent-foreground',
        )}
        asChild
      >
        <Link to={leafPath}>
          {t(item.label)}
          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[var(--color-zinc-500)] to-[var(--color-zinc-900)] transform scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300"></span>
        </Link>

      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}