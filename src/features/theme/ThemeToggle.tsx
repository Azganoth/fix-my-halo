import { Button } from "@/components/ui/Button";
import { useThemeStore } from "@/stores/useThemeStore";
import { MoonIcon, SunIcon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="size-4 transition-transform dark:scale-0 dark:-rotate-90" />
      <MoonIcon className="absolute size-4 transition-transform not-dark:scale-0 not-dark:rotate-90" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
