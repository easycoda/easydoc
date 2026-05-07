import { useCallback } from "react";
import { useParams } from "react-router-dom";
import type { TocHeading } from "@/types/doc";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const TOC_TITLE: Record<string, string> = {
  en: "On this page",
  zh: "本页目录",
};

interface TocSidebarProps {
  headings: TocHeading[];
  activeId: string;
  onHeadingClick: (id: string) => void;
}

export function TocSidebar({
  headings,
  activeId,
  onHeadingClick,
}: TocSidebarProps): React.ReactElement {
  const { lang } = useParams<{ lang: string }>();
  const title = TOC_TITLE[lang ?? "en"] ?? TOC_TITLE.en;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      onHeadingClick(id);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    },
    [onHeadingClick],
  );

  if (headings.length === 0) {
    return (
      <aside className="w-56 shrink-0 hidden xl:block">
        <div className="sticky top-20 pt-8">
          <p className="text-sm font-semibold text-foreground mb-3">{title}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "zh" ? "暂无标题" : "No headings"}
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-auto shrink-0 hidden xl:block">
      <nav className="sticky pt-8" aria-label={title}>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <ul className="space-y-1 border-l px-2">
            <p className="text-sm font-semibold text-foreground mb-3">{title}</p>

            {headings.map((heading) => {
              const isActive = heading.id === activeId;
              const indentClass =
                heading.level === 3 ? "pl-6" : "pl-2";

              return (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleClick(e, heading.id)}
                    className={cn(
                      "block text-sm py-1 transition-colors group",
                      indentClass,
                    )}
                  >
                    <span
                      className={cn(
                        " leading-snug",
                        isActive
                          ? "border-primary text-primary font-medium"
                          : "border-transparent text-muted-foreground group-hover:border-border group-hover:text-foreground",
                      )}
                    >
                      {heading.text}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </nav>
    </aside>
  );
}