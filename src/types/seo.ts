/** SEO meta configuration for HTML head generation */
export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogType: 'website' | 'article';
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage?: string;
  lang: string;
}