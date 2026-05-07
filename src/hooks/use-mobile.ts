import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean {
  // SSR guard: 在 Node.js 环境中固定返回 false（桌面端渲染模式）
  if (typeof window === "undefined") return false

  const [isMobile, setIsMobile] = React.useState<boolean>(() => window.innerWidth < MOBILE_BREAKPOINT)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}