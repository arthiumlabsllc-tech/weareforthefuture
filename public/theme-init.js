// FTF theme bootstrap — runs synchronously in <head> before first paint to
// prevent a flash of the wrong theme (FOUC). Loaded via next/script
// strategy="beforeInteractive" from src/app/layout.tsx. Kept as an external
// file (not an inline React-rendered script) so React does not emit its
// "script tag inside a component" warning.
(function () {
  try {
    var t = localStorage.getItem("ftf-theme");
    var th =
      t || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", th);
    document.documentElement.style.colorScheme = th;
  } catch (e) {
    // Storage/media-query unavailable — fall through to CSS default (light).
  }
})();
