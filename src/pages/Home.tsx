import { HeroSection } from '@/components/HeroSection';
import { FeatureCards } from '@/components/FeatureCards';

export function HomePage(): React.ReactElement {
  return (
    <main className="flex-1">
      <HeroSection />
      <FeatureCards />
    </main>
  );
}