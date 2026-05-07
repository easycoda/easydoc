import { Sun, Moon, Monitor } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themeIconMap: Record<string, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const themeLabelMap: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
}

export function ThemeToggle(): React.ReactElement {
  const { theme, setTheme } = useTheme()

  const Icon = themeIconMap[theme]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Icon className="size-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
          <DropdownMenuRadioItem value="light">
            <Sun className="size-4" />
            <span>{themeLabelMap.light}</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="size-4" />
            <span>{themeLabelMap.dark}</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="size-4" />
            <span>{themeLabelMap.system}</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}