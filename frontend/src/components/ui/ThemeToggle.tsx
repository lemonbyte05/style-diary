import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/theme";

/** 昼夜纸面切换：编辑部文字按钮 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label="切换日夜纸面"
      className={`flex items-center gap-1.5 text-folio tracking-[0.2em] text-ink-faint transition-colors hover:text-rose ${className}`}
    >
      {isDark ? <Sun size={13} strokeWidth={1.2} /> : <Moon size={13} strokeWidth={1.2} />}
      <span>{isDark ? "DAY" : "NIGHT"}</span>
    </button>
  );
}
