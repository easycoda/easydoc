import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAppStore } from "@/store/appStore"
import type { Locale } from "@/types/i18n"

import "./index.css"
import { App } from "./App"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

const rootElement = document.getElementById("root")!

/**
 * Detect whether the page contains SSG pre-rendered content.
 *
 * When the Vite plugin runs `transformIndexHtml` during build, it injects
 * compiled Markdown HTML into `<div id="root">`. If that content exists
 * (non-empty, non-whitespace), we use `hydrateRoot` so React attaches
 * event listeners without re-rendering — avoiding layout shift / flicker.
 *
 * In dev mode or for pages without SSG content, the root div is empty,
 * so we use `createRoot` instead.
 */
function hasSsgContent(): boolean {
  const html = rootElement.innerHTML
  return html.trim().length > 0
}

/**
 * Apply locale from SSG hydration data before React renders.
 *
 * The Vite SSG plugin injects `window.__HYDRATION_DATA__` into pages that
 * carry either `HydrationData` (doc pages) or `HomeHydrationData` (home page).
 * Both contain a `lang` field. Reading it here and setting the Zustand store
 * *before* `hydrateRoot`/`createRoot` ensures the first render uses the
 * correct locale — preventing a flash of wrong language on the pre-rendered
 * home page.
 */
function applyHydratedLocale(): void {
  const data = (window as unknown as Record<string, unknown>).__HYDRATION_DATA__ as
    | { lang?: string }
    | undefined
  if (data?.lang && (data.lang === "en" || data.lang === "zh")) {
    useAppStore.getState().setLocale(data.lang as Locale)
  }
}

applyHydratedLocale()

if (hasSsgContent()) {
  hydrateRoot(
    rootElement,
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}