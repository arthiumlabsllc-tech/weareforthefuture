"use client";

import { useState, useEffect, useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import { getTheme, setTheme, watchSystemTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(getTheme() === "dark");
    setMounted(true);
    const cleanup = watchSystemTheme();
    return cleanup;
  }, []);

  // Listen for themechange events from other sources
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ theme: string }>;
      setIsDark(custom.detail.theme === "dark");
    };
    window.addEventListener("themechange", handler);
    return () => window.removeEventListener("themechange", handler);
  }, []);

  const handleToggle = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    setIsDark(!isDark);
  }, [isDark]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden="true" />;
  }

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      {isDark ? (
        <Moon className="h-4.5 w-4.5 text-accent-text" />
      ) : (
        <Sun className="h-4.5 w-4.5 text-text-secondary" />
      )}
    </button>
  );
}
