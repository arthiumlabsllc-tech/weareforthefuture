# scripts/dev — CDP + QA harness (dev-only)

Throwaway Chrome DevTools Protocol (CDP) drivers and audit scripts used to
verify the FTF site during phase work. **The `*.mjs` drivers are gitignored**
(see `.gitignore`: `!/scripts/dev/` then `/scripts/dev/*.mjs`); only this
`README.md` and `CDP-HELPERS.md` are tracked, so the tooling is documented and
recreatable without committing scratch code.

All drivers expect a running Chrome with remote debugging on `:9222` and a
production server on the configured port (historically `:3125`). They read
secrets from `.env` / `.env.local` at runtime — none are hardcoded.

See [`CDP-HELPERS.md`](./CDP-HELPERS.md) for the CDP client usage and the
**theme-determinism gotcha** (localStorage leaks across a persistent profile).

## Core

| File | Purpose |
| --- | --- |
| `cdp.mjs` | Minimal CDP client (connects to Chrome on `:9222`); imported by every other driver. |
| `.dbprobe.mjs` | One-off Neon DB TCP-reachability probe (parses `DATABASE_URL`, no credentials). |

## QA / audit

| File | Purpose |
| --- | --- |
| `a11y-check.mjs` | Accessibility audit via `Accessibility.getFullAXTree` (roles, names, missing labels) per page. |
| `seo-audit.mjs` | Checks title / meta description / canonical / OG / Twitter tags + JSON-LD on each route. |
| `redirect-audit.mjs` | Verifies the legacy paths 308/301 to their targets (mirrors `next.config.ts` redirects). |
| `link-sweep.mjs` | Crawls rendered HTML for internal links; reports 404s and broken anchors. |
| `heading-order.mjs` | Validates heading hierarchy (single `h1`, no skipped levels) per page. |
| `wcag-contrast.mjs` | Computed-style WCAG AA contrast probe (effective-bg walk, `oklab()`/`color()` canvas resolver, transition-kill, main-vs-chrome split). |
| `lcp-probe.mjs` | Measures LCP / FCP / CLS candidates via `PerformanceObserver` over CDP. |
| `overflow-scan.mjs` | Detects horizontal-overflow culprits (elements wider than viewport) at a given width. |
| `mobile-qa.mjs` | Mobile viewport QA at 375 / 390 / 414 (no h-scroll, tap targets, menu). |
| `mobile-recheck.mjs` | Re-runs mobile overflow/menu checks after a fix. |
| `screenshots.mjs` | Captures verification PNGs to `.screenshots/` for the phase deliverable set. |

## One-off diagnostic probes (historical)

| File | Purpose |
| --- | --- |
| `find-breakout.mjs` | Bisects the DOM to find which element breaks out of its container. |
| `isolate-overflow.mjs` | Isolates overflow by hiding subtrees to pinpoint the culprit. |
| `overflow-culprit.mjs` | Reports the specific overflowing element(s) at a width. |
| `test-fix.mjs` | Quick before/after check that a specific fix resolved the target issue. |
| `inspect-nav.mjs` | Ground-truth probe of navbar/footer button visibility + computed styles. |
| `inspect-nav2.mjs` | Resolves the true backdrop/gradient behind nav buttons (WCAG false-positive check). |
| `inspect-footer.mjs` | Pins theme and captures footer computed colors + screenshots (both themes). |

## Phase screenshot drivers (historical)

| File | Purpose |
| --- | --- |
| `cdp-shot.mjs` | Generic single/multi-shot capture helper. |
| `cdp-zoom.mjs` | Zoomed / detail captures. |
| `cdp-about.mjs` | About-tree screenshots. |
| `cdp-phase3b2.mjs` | Phase 3b.2 captures. |
| `cdp-phase4.mjs` | Phase 4 impact-tree captures. |
| `cdp-phase5.mjs` | Phase 5 give-hub captures. |
| `cdp-phase6.mjs` | Phase 6 Nigeria-page captures. |
| `cdp-phase65.mjs` | Phase 6.5 captures. |
| `cdp-phase66.mjs` | Phase 6.6 captures. |
| `cdp-phase66b.mjs` | Phase 6.6 follow-up captures. |
