import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';


import { useIsMobile } from '@/hooks/use-mobile';
import { siteConfig } from '@/lib/siteConfig';

import {
  NavigationMenu,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SearchTrigger } from '@/components/SearchTrigger';
import { SearchDialog } from '@/components/SearchDialog';
import { DesktopNavItem } from '@/components/DesktopNavItem';
import { MobileNavList } from '@/components/MobileNavList';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HeaderProps {
  /** When `true`, renders the SidebarTrigger (only on non-home pages). */
  showSidebarTrigger?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Sticky top navigation bar.
 *
 * Desktop: uses shadcn/ui `NavigationMenu` with `DesktopNavItem` for each
 * item in `siteConfig.nav`. Supports nested dropdowns.
 *
 * Mobile: uses a `Sheet` containing `MobileNavList`, which supports
 * collapsible nested menu items.
 *
 * Right-side actions (Search, Theme, Language) are unchanged.
 *
 * The component owns the `open`/`onOpenChange` state for `SearchDialog`.
 */
export function Header({
  showSidebarTrigger = false,
}: HeaderProps): React.ReactElement {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchOpen = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const handleSearchOpenChange = useCallback((open: boolean) => {
    setSearchOpen(open);
  }, []);

  const closeSheet = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 items-center gap-4 px-4 sm:px-6">
        {/* ---- Left: Logo + title ---- */}
        <div className="flex shrink-0 items-center gap-2">
          {showSidebarTrigger && (
            <SidebarTrigger className="mr-1" />
          )}
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <img src="/easydoc/logo.png" alt="Logo" className="size-6 dark:invert" aria-hidden="true" />
            <span className="hidden sm:inline">{siteConfig.title}</span>
          </Link>
        </div>

        {/* ---- Center: Desktop nav (NavigationMenu) ---- */}
        {!isMobile && (
          <div className="hidden flex-1 items-center justify-center sm:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {siteConfig.nav.map((item) => (
                  <DesktopNavItem key={item.label} item={item} />
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        )}

        {/* ---- Right: actions ---- */}
        <div className="flex flex-1 items-center justify-end gap-1 sm:flex-none">
          <SearchTrigger onOpen={handleSearchOpen} />

          <ThemeToggle />

          <LanguageSwitcher />

        </div>
      </div>

      {/* ---- Search dialog ---- */}
      <SearchDialog open={searchOpen} onOpenChange={handleSearchOpenChange} />
    </header>
  );
}