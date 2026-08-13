import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/theme";

/** 昼夜纸面切换按钮 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={toggle}
      aria-label="切换日夜纸面"
      title={isDark ? "回到白天" : "进入夜晚"}
      className={`flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-paper-soft text-ink-soft shadow-1 transition-colors hover:text-rose ${className}`}
    >
      {isDark ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
    </motion.button>
  );
}
