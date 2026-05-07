import { lazy, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { Layout } from '@/components/Layout';

// ---------------------------------------------------------------------------
// Lazy-loaded page components (code-split per route)
// ---------------------------------------------------------------------------

const HomePage = lazy(
  () => import('@/pages/Home').then(m => ({ default: m.HomePage })),
) as ComponentType;

const LangHomePage = lazy(
  () => import('@/pages/LangHome').then(m => ({ default: m.LangHomePage })),
) as ComponentType;

const DocPage = lazy(
  () => import('@/pages/Doc').then(m => ({ default: m.DocPage })),
) as ComponentType;

const NotFoundPage = lazy(
  () => import('@/pages/NotFound').then(m => ({ default: m.NotFoundPage })),
) as ComponentType;

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ':lang', element: <LangHomePage /> },
      { path: ':lang/*', element: <DocPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);