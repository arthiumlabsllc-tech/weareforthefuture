/**
 * FTF Theme Manager
 * Handles light/dark theme with localStorage persistence,
 * system preference detection, and live OS theme change listening.
 */

const STORAGE_KEY = "ftf-theme";
type Theme = "light" | "dark";

/** Get current theme: localStorage → system preference → 'light' fallback */
export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable
  }

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

/** Apply theme to DOM, save to localStorage, dispatch event */
export function setTheme(theme: Theme): void {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;

  // Update theme-color meta tag
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#16181A" : "#F6F7F8");
  }

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable
  }

  // Dispatch custom event so components can react
  window.dispatchEvent(
    new CustomEvent("themechange", { detail: { theme } })
  );
}

/** Toggle between light and dark */
export function toggleTheme(): void {
  const current = getTheme();
  setTheme(current === "light" ? "dark" : "light");
}

/** Initialize theme on page load — call once */
export function initTheme(): Theme {
  const theme = getTheme();
  setTheme(theme);
  return theme;
}

/** Watch for OS theme changes. Auto-updates only if user hasn't chosen manually. */
export function watchSystemTheme(): () => void {
  if (typeof window === "undefined") return () => {};

  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (e: MediaQueryListEvent) => {
    // Only auto-switch if user hasn't explicitly chosen
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setTheme(e.matches ? "dark" : "light");
      }
    } catch {
      setTheme(e.matches ? "dark" : "light");
    }
  };

  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
