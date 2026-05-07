import type { SiteConfig } from '../types/config';

export const siteConfig: SiteConfig = {
  title: 'EasyDoc',
  description: 'EasyDoc - A modern documentation site',
  baseUrl: 'https://docs.easycoda.com',
  ogImage: '/logo.png',
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  nav: [
    {
      label: 'nav.home',
      path: '/'
    },
    {
      label: 'nav.getting-started',
      children: [
        {
          label: 'Getting Started',
          path: '/getting-started/getting-started',
        },
        {
          label: 'Configuration',
          path: '/getting-started/configuration',
        }
      ],
    },
    {
      label: 'nav.guide',
      children: [
        {
          label: 'Markdown Features',
          path: '/guides/markdown-syntax',
        },
        {
          label: 'Search',
          path: '/guides/search',
        },
      ],
    },
    {
      label: 'nav.github',
      path: 'https://github.com/easycoda/easydoc',
      external: true,
    },
  ],
  footer: {
    copyright: `© ${new Date().getFullYear()} EasyDoc. All rights reserved.`,
    links: [
      { text: 'EasyCoda', link: 'https://easycoda.com' },
      { text: 'GitHub', link: 'https://github.com/easycoda/easydoc' },
    ],
  },
  socialLinks: [
    {
      icon: 'Github',
      link: 'https://github.com/easycoda/easydoc',
      label: 'GitHub',
    },
    {
      icon: 'Twitter',
      link: 'https://twitter.com/@easy_coda',
      label: 'Twitter',
    },
  ],
};