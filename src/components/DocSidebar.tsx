import type { DocManifest } from "@/types/doc";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocSidebarItem } from "@/components/DocSidebarItem";

interface DocSidebarProps {
  manifest: DocManifest;
  currentPath: string;
}

export function DocSidebar({
  manifest,
  currentPath,
}: DocSidebarProps): React.ReactElement {
  return (
    <Sidebar>
      <SidebarHeader className="pt-14">

      </SidebarHeader>
      <SidebarContent>
        <ScrollArea>
          <SidebarGroup>
            <SidebarMenu>
              {manifest.nav.map((item) => (
                <DocSidebarItem
                  key={item.path}
                  item={item}
                  depth={0}
                  activePath={currentPath}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}