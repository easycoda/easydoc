import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/index';
import { useAppStore } from '@/store/appStore';

export function HeroSection(): React.ReactElement {
  const t = useTranslation();
  const locale = useAppStore((state) => state.locale);

  return (
    <section
      className="relative flex flex-col items-center justify-center px-4 py-24 md:py-32 lg:py-40"
      aria-labelledby="hero-title"
    >
      {/* Background gradient decoration */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto flex flex-col items-center text-center gap-6">
        {/* Badge / eyebrow */}
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-medium text-primary">
          {t['home.hero.subtitle']}
        </span>

        {/* Title */}
        <h1
          id="hero-title"
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {t['home.hero.title']}
        </h1>

        {/* Description */}
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
          {t['home.description']}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" variant="default">
            <Link to={`/${locale}/getting-started/getting-started`}>
              {t['home.hero.cta']}
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline">
            <Link to={`/${locale}/index`}>
              <BookOpen className="mr-1 size-4" />
              {t['home.hero.secondary']}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}