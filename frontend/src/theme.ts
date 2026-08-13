import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

function detectTheme(): Theme {
  const param = new URLSearchParams(window.location.search).get("dark");
  if (param) return "dark";
  const saved = localStorage.getItem("msd-theme");
  if (saved === "dark" || saved === "light") return saved;
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(detectTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("msd-theme", theme);
  }, [theme]);

  return {
    theme,
    toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
  };
}
