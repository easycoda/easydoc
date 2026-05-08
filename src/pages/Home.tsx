import { HeroSection } from '@/components/HeroSection';
import { FeatureCards } from '@/components/FeatureCards';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useTranslation } from '@/i18n/index';
import { siteConfig } from '@/lib/siteConfig';

export function HomePage(): React.ReactElement {
  const t = useTranslation();
  useDocumentTitle(t['home.title'] || siteConfig.title);
  return (
    <main className="flex-1">
      <HeroSection />
      <FeatureCards />
    </main>
  );
}