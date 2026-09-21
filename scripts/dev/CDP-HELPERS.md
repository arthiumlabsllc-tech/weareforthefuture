# CDP Screenshot Helpers (dev-only)

Throwaway Chrome DevTools Protocol drivers used to capture verification
screenshots of the FTF site during phase work. They now live in **`scripts/dev/`**
and are **gitignored** there (`/scripts/dev/*.mjs`); the two docs in this folder
(`README.md`, this file) are the only tracked entries. A full inventory of every
driver is in [`README.md`](./README.md).

## Drivers

| File | Purpose |
| --- | --- |
| `cdp-shot.mjs` | Generic single/multi-shot capture helper. |
| `cdp-about.mjs` | About-tree screenshots. |
| `cdp-phase3b2.mjs` | Phase 3b.2 captures. |
| `cdp-phase4.mjs` | Phase 4 impact-tree captures (13 shots). |
| `cdp-zoom.mjs` | Zoomed / detail captures. |
| `.dbprobe.mjs` | Quick Neon DB connectivity probe. |

## Running

These spawn a real `chrome.exe`, which the agent sandbox blocks - run them with
elevated permissions (`required_permissions='all'`). Each driver starts a
production server (or expects one on the configured port), opens a persistent
profile, and writes PNGs to its `.phase*-shots/` output dir (also gitignored).

```powershell
node cdp-phase4.mjs
```

## GOTCHA - theme determinism (the important one)

`public/theme-init.js` resolves the initial theme from
**`localStorage["ftf-theme"]` first**, falling back to `prefers-color-scheme`
only when that key is absent. `setTheme()` writes the key, and
`watchSystemTheme()` re-writes it on emulated-media changes.

Because the drivers use a **persistent CDP profile**, that localStorage key
**leaks across shots**. Emulating `prefers-color-scheme: dark` is then ignored
(the stored key wins), producing **byte-identical "light" and "dark" captures**
- a silent false pass.

**Fix:** seed the key to the intended theme *before* each navigation:

```js
await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: shot.theme }] });
await cdp.send("Runtime.evaluate", {
  expression: `try{localStorage.setItem('ftf-theme', ${JSON.stringify(shot.theme)})}catch(e){}`,
});
await cdp.send("Page.navigate", { url: shot.url });
```

**Verify:** light vs dark PNGs for the same route must differ in byte size. If
they are identical, the theme leaked - re-seed localStorage.

## Other notes

- **Scroll to latch animations:** Framer Motion `whileInView` sections only
  render after scrolling; drivers scroll the page before capture. The
  `scrollText` option crops to a section by heading text.
- **Don't grep the captured HTML with ripgrep:** Next.js RSC flight data is one
  giant line and the `Grep`/ripgrep tool returns false negatives. Use
  PowerShell: `(Select-String -Path $f -Pattern ([regex]::Escape($t)) -AllMatches).Matches.Count`
  (`-SimpleMatch` does **not** populate `.Matches`).
