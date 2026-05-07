import { Link } from 'react-router-dom';
import type { DocNavRef } from '@/types/doc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n';
interface DocNavProps {
  prev: DocNavRef | null;
  next: DocNavRef | null;
}

export function DocNav({ prev, next }: DocNavProps): React.ReactElement | null {
  const t = useTranslation();
  if (!prev && !next) {
    return null;
  }

  return (
    <Card className="mt-12 pt-6 border-t ring-0 rounded-none bg-transparent">
      <nav className="flex justify-between items-center px-1 gap-4" aria-label="Document Navigation">
        {prev ? (
          <Button variant="ghost" asChild className="group h-auto flex-col items-start gap-0.5 px-3 py-2 w-full border">
            <Link to={prev.path} className="max-w-[48%] ">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ChevronLeft className="size-3" />
                {t["doc.nav.previous"]}
              </span>
              <span className="text-sm font-medium group-hover:text-foreground transition-colors truncate max-w-full">
                {prev.title}
              </span>
            </Link>
          </Button>
        ) : (
          <div aria-hidden="true" />
        )}

        {next ? (
          <Button variant="ghost" asChild className="group h-auto flex-col items-end gap-0.5 px-3 py-2 ml-auto w-full border">
            <Link to={next.path} className="max-w-[48%]">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {t["doc.nav.next"]}
                <ChevronRight className="size-3" />
              </span>
              <span className="text-sm font-medium group-hover:text-foreground transition-colors truncate max-w-full text-right">
                {next.title}
              </span>
            </Link>
          </Button>
        ) : (
          <div aria-hidden="true" />
        )}
      </nav>
    </Card>
  );
}