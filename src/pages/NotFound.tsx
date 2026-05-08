import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n/index';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage(): React.ReactElement {
  const t = useTranslation();
  useDocumentTitle(t['notfound.title'] || '404 - Page Not Found');
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        {/* Large 404 heading */}
        <h1 className="mb-4 text-8xl font-extrabold tracking-tight text-primary">
          404
        </h1>

        {/* Title */}
        <h2 className="mb-2 text-2xl font-semibold text-foreground">
          {t['notfound.title']}
        </h2>

        {/* Description */}
        <p className="mb-8 max-w-md text-muted-foreground">
          {t['notfound.description']}
        </p>

        {/* Back to Home button */}
        <Button asChild size="lg">
          <Link to="/">
            <Home className="size-4" />
            {t['notfound.back']}
          </Link>
        </Button>
      </div>
    </main>
  );
}

export default NotFoundPage;