import { useCallback, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from '@/i18n';
import type { DocNavItem } from "@/types/doc";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface DocSidebarItemProps {
  item: DocNavItem;
  depth: number;
  activePath: string;
}

/** Checks whether the given item or any descendant matches the active path. */
function hasActiveDescendant(item: DocNavItem, activePath: string): boolean {
  if (item.path === activePath) return true;
  if (item.children && item.children.length > 0) {
    return item.children.some((child) => hasActiveDescendant(child, activePath));
  }
  return false;
}

export function DocSidebarItem({
  item,
  depth,
  activePath,
}: DocSidebarItemProps): React.ReactElement {
  const isActive = item.path === activePath;
  const hasChildren = item.children && item.children.length > 0;
  const defaultOpen = hasActiveDescendant(item, activePath);
  const t = useT;
  const [open, setOpen] = useState(defaultOpen);

  const handleTriggerClick = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // Leaf node — no children
  if (!hasChildren) {
    if (depth === 0) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isActive}>
            <Link to={item.path}>{t(item.title)}</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={isActive}>
          <Link to={item.path}>{t(item.title)}</Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  // Branch node — renders collapsible wrapper
  return (
    <Collapsible open={open} onOpenChange={setOpen} defaultOpen={defaultOpen}>
      <SidebarMenuItem>
        {depth === 0 ? (
          <SidebarMenuButton asChild isActive={isActive}>
            <CollapsibleTrigger asChild>
              <button
                onClick={handleTriggerClick}
                className="flex w-full items-center gap-2"
              >
                <span className="flex-1 truncate text-left">{t(item.title)}</span>
                <ChevronRight
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-200",
                    open && "rotate-90"
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </SidebarMenuButton>
        ) : (
          <SidebarMenuSubButton asChild isActive={isActive}>
            <CollapsibleTrigger asChild>
              <button
                onClick={handleTriggerClick}
                className="flex w-full items-center gap-2"
              >
                <span className="flex-1 truncate text-left">{t(item.title)}</span>
                <ChevronRight
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-200",
                    open && "rotate-90"
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </SidebarMenuSubButton>
        )}
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children!.map((child) => (
              <DocSidebarItem
                key={child.path}
                item={child}
                depth={depth + 1}
                activePath={activePath}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}