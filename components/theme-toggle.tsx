"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("my-day-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextDark = saved ? saved === "dark" : preferred;
    setDark(nextDark);
    document.documentElement.dataset.theme = nextDark ? "dark" : "light";
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("my-day-theme", next ? "dark" : "light");
  };

  return (
    <button className={`theme-toggle ${compact ? "compact" : ""}`} onClick={toggle} type="button" aria-label="Переключить тему">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
      {!compact && <span>{dark ? "Светлая тема" : "Тёмная тема"}</span>}
    </button>
  );
}
