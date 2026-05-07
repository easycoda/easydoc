import { Link } from 'react-router-dom';
import { Github, Twitter, ExternalLink, type LucideIcon } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { useTranslation } from '@/i18n';

const iconMap: Record<string, LucideIcon> = {
  Github,
  Twitter,
};

export function Footer(): React.ReactElement {
  const { copyright, links } = siteConfig.footer;
  const socialLinks = siteConfig.socialLinks ?? [];
  const t = useTranslation();
  return (
    <footer
      role="contentinfo"
      className="border-t z-10 border-border mt-auto bg-card-foreground dark:bg-accent py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="container mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Column 1 — Copyright */}
          <div className="flex flex-col gap-2">
            <span className="text-lg font-bold text-primary-foreground">{siteConfig.title}</span>
            <p className="text-sm text-input dark:text-muted-foreground">{copyright}</p>
          </div>

          {/* Column 2 — Footer Links */}
          <div className='md:text-center'>
            <h3 className="mb-3 text-sm font-semibold text-primary-foreground">
              {t["footer.links"]}
              
            </h3>
            {links.length > 0 && (
              <nav aria-label="Footer links">
                <ul className="flex flex-col gap-2">
                  {links.map((item) => {
                    const isExternal =
                      item.link.startsWith('http://') ||
                      item.link.startsWith('https://');

                    if (isExternal) {
                      return (
                        <li key={item.link}>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-input dark:text-muted-foreground transition-colors hover:text-primary-foreground"
                          >
                            {item.text}
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={item.link}>
                        <Link
                          to={item.link}
                          className="text-sm text-input dark:text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {item.text}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </div>

          {/* Column 3 — Social Links */}
          <div className='md:text-right'>
            <h3 className="mb-3 text-sm font-semibold text-primary-foreground">
              {t["footer.community"]}
            </h3>
            {socialLinks.length > 0 && (
              <div className="flex flex-row gap-3 md:justify-end">
                {socialLinks.map((item) => {
                  const IconComponent = iconMap[item.icon];
                  if (!IconComponent) {
                    return (
                      <a
                        key={item.link}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="inline-flex items-center justify-center rounded-md p-2 text-input transition-colors hover:bg-secondary-foreground hover:text-primary-foreground"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    );
                  }
                  return (
                    <a
                      key={item.link}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="inline-flex items-center justify-center rounded-md p-2 text-input transition-colors hover:bg-secondary-foreground hover:text-primary-foreground"
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-secondary-foreground pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t["footer.built"]}
          </p>
        </div>
      </div>
    </footer>
  );
}