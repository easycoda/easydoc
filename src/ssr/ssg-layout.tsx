import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { TocHeading } from '@/types/doc';
import type { SsgLayoutProps } from '@/types/ssg';

import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';

import { Header } from '@/components/Header';
import { DocSidebar } from '@/components/DocSidebar';
import { TocSidebar } from '@/components/TocSidebar';
import { Footer } from '@/components/Footer';

// ---------------------------------------------------------------------------
// DocContext – identical to Layout.tsx so DocContent can communicate headings
// to TocSidebar during SSR. SSR children (e.g. DocContent) may still call
// useDocContext().
// ---------------------------------------------------------------------------

interface DocContextValue {
  headings: TocHeading[];
  activeHeadingId: string;
  setHeadings: (headings: TocHeading[]) => void;
  setActiveHeadingId: (id: string) => void;
}

const DocContext = createContext<DocContextValue | null>(null);

export function useDocContext(): DocContextValue {
  const ctx = useContext(DocContext);
  if (!ctx) {
    throw new Error(
      'useDocContext must be used within a SsgLayout (DocContext.Provider).',
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// SsgLayout – SSR-only Layout
// ---------------------------------------------------------------------------

/**
 * SSR 环境专用的布局组件，对标客户端的 `Layout.tsx`。
 *
 * 与客户端 Layout 的关键差异：
 * 1. 不直接调用路由 hooks（useLocation / useParams）——路由上下文由外层的
 *    StaticRouter + Routes 提供，子组件（Header / TocSidebar）仍可使用。
 * 2. 不调用 useQuery ——数据由调用方通过 QueryClient.setQueryData 预填充。
 * 3. 不渲染 <Outlet /> ——直接渲染 {children}。
 * 4. 渲染决策（onDocPage / manifest / headings）完全通过 props 传入。
 */
export function SsgLayout({
  context,
  children,
}: SsgLayoutProps): React.ReactElement {
  const {
    lang,
    currentPath,
    onDocPage,
    manifest,
    headings: initialHeadings,
    translations: _translations,
    siteConfig: _siteConfig,
  } = context;

  // ---- DocContext state (mirrors Layout.tsx) ----
  // SSR 时 headings 由调用方通过 context 传入，但 DocContext 仍需初始化
  // 以便 DocContent / useDocContext 正常工作。
  const [headings, setHeadings] = useState<TocHeading[]>(
    initialHeadings ?? [],
  );
  const [activeHeadingId, setActiveHeadingId] = useState('');

  const docContextValue = useMemo<DocContextValue>(
    () => ({
      headings,
      activeHeadingId,
      setHeadings,
      setActiveHeadingId,
    }),
    [headings, activeHeadingId],
  );

  // ---- Scroll helper (SSR no-op at render time, but required by TocSidebar) ----
  const handleHeadingClick = useCallback((_id: string) => {
    // SSR 环境下不执行滚动，但提供回调签名以匹配 TocSidebar props
  }, []);

  // ---- SSR 环境: isMobile 恒为 false（桌面端渲染），因此 DocSidebar
  //     和 TocSidebar 始终以内联方式渲染（不使用移动端 Sheet）。 ----

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <DocContext.Provider value={docContextValue}>
      <SidebarProvider defaultOpen={onDocPage}>
        <div className="flex min-h-screen flex-col w-full">
          {/* ---- Header ---- */}
          <Header showSidebarTrigger={onDocPage} />

          {/* ---- Body ---- */}
          <div className="flex flex-1">
            {/* Doc sidebar – SSR: isMobile===false, always inline */}
            {onDocPage && manifest && (
              <div className="shrink-0">
                <DocSidebar
                  manifest={manifest}
                  currentPath={currentPath}
                />
              </div>
            )}

            {/* Main content area */}
            <SidebarInset>
              <div className="mx-auto flex w-full flex-col flex-1 xl:flex-row xl:gap-4 max-w-(--breakpoint-2xl) xl:max-w-[calc(var(--breakpoint-2xl)+15rem)]">
                <main className="flex-1 min-w-0 p-4">
                  {children}
                </main>

                {/* TOC sidebar – only on doc pages (SSR: always desktop) */}
                {onDocPage && (
                  <TocSidebar
                    headings={headings}
                    activeId={activeHeadingId}
                    onHeadingClick={handleHeadingClick}
                  />
                )}
              </div>
            </SidebarInset>
          </div>

          {/* ---- Footer ---- */}
          <Footer />
        </div>
      </SidebarProvider>
    </DocContext.Provider>
  );
}