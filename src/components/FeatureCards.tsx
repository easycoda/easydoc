import {
  FileText,
  Globe,
  Search,
  Moon,
  Zap,
  Code2,
  Sigma,
  GitBranch,
  PanelLeft,
  SearchCheck,
  Rocket,
  Palette,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useTranslation } from '@/i18n/index';

interface FeatureItem {
  icon: React.ReactElement;
  titleKey: string;
  descKey: string;
}

const features: FeatureItem[] = [
  {
    icon: <FileText className="size-6" />,
    titleKey: 'features.markdown.title',
    descKey: 'features.markdown.desc',
  },
  {
    icon: <Globe className="size-6" />,
    titleKey: 'features.multilang.title',
    descKey: 'features.multilang.desc',
  },
  {
    icon: <Search className="size-6" />,
    titleKey: 'features.search.title',
    descKey: 'features.search.desc',
  },
  {
    icon: <Moon className="size-6" />,
    titleKey: 'features.theme.title',
    descKey: 'features.theme.desc',
  },
  {
    icon: <Zap className="size-6" />,
    titleKey: 'features.ssg.title',
    descKey: 'features.ssg.desc',
  },
  {
    icon: <Code2 className="size-6" />,
    titleKey: 'features.shiki.title',
    descKey: 'features.shiki.desc',
  },
  {
    icon: <Sigma className="size-6" />,
    titleKey: 'features.katex.title',
    descKey: 'features.katex.desc',
  },
  {
    icon: <GitBranch className="size-6" />,
    titleKey: 'features.mermaid.title',
    descKey: 'features.mermaid.desc',
  },
  {
    icon: <PanelLeft className="size-6" />,
    titleKey: 'features.responsive.title',
    descKey: 'features.responsive.desc',
  },
  {
    icon: <SearchCheck className="size-6" />,
    titleKey: 'features.seo.title',
    descKey: 'features.seo.desc',
  },
  {
    icon: <Rocket className="size-6" />,
    titleKey: 'features.deploy.title',
    descKey: 'features.deploy.desc',
  },
  {
    icon: <Palette className="size-6" />,
    titleKey: 'features.multitheme.title',
    descKey: 'features.multitheme.desc',
  },
];

export function FeatureCards(): React.ReactElement {
  const t = useTranslation();

  return (
    <section
      className="px-4 py-16 md:py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <h2
          id="features-heading"
          className="mb-12 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
        >
          {t['home.features.title']}
        </h2>

        {/* Feature cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.titleKey} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <CardTitle>{t[feature.titleKey]}</CardTitle>
                <CardDescription>{t[feature.descKey]}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}