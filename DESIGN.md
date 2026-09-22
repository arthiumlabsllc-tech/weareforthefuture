# FTF Design System

Last updated: 2026-09-21
Owner: FTF web team (Arthium Labs LLC)
Approval required for changes: yes

Source of truth: `src/app/globals.css` (Layer 1 `:root` / `[data-theme="dark"]` custom properties, Layer 2 Tailwind `@theme inline` mapping, Layer 3 dark-mode palette remaps). Every value below is read from that file; if this document and the CSS disagree, the CSS wins and this document must be corrected with a changelog entry.

## 1. Brand colors

### Backgrounds, surfaces, borders

| Token | Light | Dark | Where used |
| --- | --- | --- | --- |
| --color-bg-primary | #F6F7F8 | #16181A | page background |
| --color-bg-secondary | #FFFFFF | #1E2124 | alternating section background |
| --color-bg-tertiary | #EDF0F2 | #262A2D | hover fills, subtle bands |
| --color-bg-elevated | #FFFFFF | #2E3336 | popovers, raised panels |
| --color-bg-overlay | rgba(73,73,73,0.5) | rgba(0,0,0,0.7) | modal/lightbox scrims |
| --ftf-cream / --color-cream | #FAF7F1 | #16181A | page background, warm paper |
| --ftf-sand / --color-sand | #EFE9DD | #1E2124 | alternate section, deeper warm |
| --ftf-surface / --color-surface | #FFFFFF | #1E2124 | cards, inputs |
| --ftf-surface-hover | #F1F3F5 | #262A2D | card/input hover |
| --ftf-border / --color-border | #E2E6E9 | #33383C | hairline borders |
| --ftf-border-strong / --color-border-strong | #C6CDD2 | #494949 | input borders, strong dividers |
| --ftf-divider / --color-divider | #E8EBEE | #2C3134 | section dividers |

### Text

| Token | Light | Dark | Where used |
| --- | --- | --- | --- |
| --ftf-text-primary | #333333 | #F2F4F5 | headings, body emphasis |
| --ftf-text-secondary | #494949 | #C6CBCF | body copy (brand charcoal) |
| --ftf-text-tertiary | #6C7277 | #9BA1A6 | labels, meta |
| --ftf-text-muted | #9AA1A6 | #6E7478 | placeholders, captions |
| --ftf-text-inverse | #F6F7F8 | #16181A | inverted bands |
| --ftf-text-on-primary | #FFFFFF | #FFFFFF | text on blue (both themes) |
| --ftf-text-link / -hover | #3973B8 / #2E5F9C | #7FA9DC / #A6C4E8 | inline links |

### Brand

| Token | Light | Dark | Where used |
| --- | --- | --- | --- |
| --ftf-primary | #3973B8 | #3973B8 | trust surfaces: footer band, login brand panel, secondary buttons |
| --ftf-primary-hover | #2E5F9C | #2E5F9C | blue hover |
| --ftf-primary-active | #265085 | #265085 | blue pressed |
| --ftf-primary-subtle | #EAF1F9 | #1A2634 | blue tint backgrounds |
| --ftf-accent | #4CB64D | #6FCB70 | progress, icons, chips ONLY - never a button background |
| --ftf-accent-hover | #2E7D32 | #8FD890 | light-mode button green (with white text) |
| --ftf-accent-subtle | #EDF8EE | #16281A | green tint backgrounds |
| --ftf-accent-text | #2E7D32 | #8FD890 | green text on light/dark |
| --ftf-accent-bright | #8FD890 | #8FD890 | accents on blue panels |

### CTA pair (the only green button pattern)

| Token | Light | Dark | Where used |
| --- | --- | --- | --- |
| --ftf-cta-bg / --color-cta | #2E7D32 | #6FCB70 | every green CTA background |
| --ftf-cta-bg-hover / --color-cta-hover | #256428 | #5CB85E | green CTA hover |
| --ftf-cta-text / --color-on-cta | #FFFFFF | #16181A | green CTA label |

Light pair measures ≈4.78:1, dark pair ≈8.3:1 (WCAG AA). The mid accent green #4CB64D behind white or navy text measures ≈2.5:1 and is BANNED as a button background.

### Semantic

| Token | Light | Dark | Where used |
| --- | --- | --- | --- |
| --ftf-success / -bg / -text | #2E7D32 / #E8F5E9 / #1B5E20 | #6FCB70 / #16281A / #9ADF9B | success states, confirmations |
| --ftf-warning / -bg / -text | #D97706 / #FDF4E3 / #8A5300 | #E5A44A / #2A2214 / #EFC078 | pilot status, cautions |
| --ftf-error / -bg / -text | #C7442E / #FBE8E4 / #8A2A1B | #E87560 / #2E1814 / #F5A89A | form errors, destructive |
| --ftf-info / -bg / -text | #3973B8 / #EAF1F9 / #265085 | #3973B8 / #14202E / #A6C4E8 | informational notices |
| --ftf-on-success | #FFFFFF | #16181A | text on success fills |

### Trust layer

| Token | Light | Dark | Where used |
| --- | --- | --- | --- |
| --ftf-trust-bg | #FFFFFF | #1E2124 | trust chip/card background |
| --ftf-trust-border | #E2E6E9 | #33383C | trust chip border |
| --ftf-trust-icon | #4CB64D | #6FCB70 | trust iconography |
| --ftf-trust-text | #494949 | #C6CBCF | trust statement text |
| --ftf-trust-meta | #6C7277 | #9BA1A6 | trust meta lines |

### Pillar accents

| Token | Light | Dark | Where used |
| --- | --- | --- | --- |
| --ftf-pillar-1 | #3973B8 | #7FA9DC | Education pillar |
| --ftf-pillar-2 | #C7442E | #E87560 | Girls' empowerment pillar |
| --ftf-pillar-3 | #3973B8 | #7FA9DC | Future-ready skills pillar |
| --ftf-pillar-4 | #4CB64D | #6FCB70 | Mentorship & wellbeing pillar |
| --ftf-pillar-5 | #494949 | #C6CBCF | Community support pillar |

Inline styles must reference `--ftf-pillar-N` (always emitted), never `--color-pillar-N` (tree-shaken when only used from inline style strings).

### Impact, journey/progress, content patterns

| Token | Light | Dark | Where used |
| --- | --- | --- | --- |
| --ftf-impact-number | #3973B8 | #7FA9DC | impact stat numerals |
| --ftf-impact-label | #6C7277 | #9BA1A6 | impact stat labels |
| --ftf-impact-meta | #9AA1A6 | #6E7478 | impact stat meta |
| --ftf-journey-track | #EDF0F2 | #262A2D | journey stepper track |
| --ftf-journey-fill | #4CB64D | #6FCB70 | journey progress fill |
| --ftf-journey-node | #3973B8 | #7FA9DC | journey node idle |
| --ftf-journey-node-active | #4CB64D | #6FCB70 | journey node active |
| --ftf-quote-mark | #4CB64D | #6FCB70 | pull-quote marks |
| --ftf-story-bg | #FFFFFF | #1E2124 | story cards |
| --ftf-story-tag / -text | #EDF8EE / #2E7D32 | #16281A / #9ADF9B | story category tags |
| --ftf-report-bg | #FFFFFF | #1E2124 | report cards |
| --ftf-status-active | #2E7D32 | #6FCB70 | status pill: active |
| --ftf-status-pilot | #D97706 | #E5A44A | status pill: pilot |
| --ftf-status-archived | #6C7277 | #9BA1A6 | status pill: archived |
| --ftf-status-campaign | #C7442E | #E87560 | status pill: campaign |

### System

| Token | Light | Dark | Where used |
| --- | --- | --- | --- |
| --ftf-shadow-color | rgba(73,73,73,0.08) | rgba(0,0,0,0.5) | card shadows |
| --ftf-shadow-sm | 0 1px 2px rgba(57,115,184,0.05) | 0 1px 2px rgba(0,0,0,0.3) | card resting shadow (shadow-sm) |
| --ftf-shadow-md | 0 4px 16px rgba(57,115,184,0.08) | 0 4px 16px rgba(0,0,0,0.5) | card hover shadow (shadow-md) |
| --ftf-focus-ring | 0 0 0 3px rgba(57,115,184,0.35) | 0 0 0 3px rgba(127,169,220,0.5) | :focus-visible everywhere |
| --ftf-scrollbar-track / -thumb | #EDF0F2 / #C6CDD2 | #1E2124 / #494949 | scrollbars |
| --ftf-selection-bg / -text | #4CB64D / #0E2E0F | #4CB64D / #0E2E0F | ::selection |

### Sand AA override (light mode)

Sand (#EFE9DD) fails WCAG AA for text-tertiary, text-muted, accent-text, and trust-meta. A scoped override in globals.css re-maps those tokens within .bg-sand to darker values (#5F6569, #1B5E20). If you use sand as a background, this override applies automatically. Do NOT remove it without verifying contrast.

### Rules

- Never invent new hues. If a need is not covered above, ask before adding a token (globals.css requires explicit approval).
- Never use raw hex in JSX (`text-[#...]`, `bg-[#...]`, inline `style` hex). Enforced by `npm run check-design-tokens`.
- Chart/decorative palettes come from the shared map in `src/lib/chartColors.ts` (theme-aware `var(--ftf-*)` references), never raw hex.
- Documented exemptions only: lines carrying the `design-tokens-exempt` marker (skipped by the checker) - currently `global-error.tsx` (error boundary must inline styles) and the `theme-color` meta literals in `layout.tsx` / `theme.ts` (browser APIs read raw hex).
- Green (#4CB64D) = progress/icons/chips ONLY. Buttons use the CTA pair (accent-hover green + accessible text), never mid accent green.
- Blue = trust signals, NOT CTAs.
- Legacy Tailwind palettes (navy-*, gold-*, emerald-*, coral-*) exist only so old classes keep resolving and auto-adapt in dark mode (Layer 3). New code must use semantic tokens.
- The Tailwind `white` utility INVERTS to the dark surface in dark mode (Layer 3). On surfaces that stay the same colour in both themes (e.g. the blue footer band) use `text-text-on-primary` and opacity variants of it, or the scoped `footer.bg-primary { --color-white: #FFFFFF; }` override already in globals.css.

## 2. Typography

- Display: Playfair Display (`--font-display`) - H1, H2, pull quotes, hero display lines.
- Body: Inter (`--font-sans`) - body, UI, links, labels.
- Body line-height: 1.7 (set on `body`).
- Scale (Tailwind steps in use): text-xs 0.75rem (eyebrows, labels, meta), text-sm 0.875rem (UI, small body), text-base 1rem (body), text-lg 1.125rem (lede), text-xl 1.25rem, text-2xl 1.5rem (H3), text-3xl 1.875rem (H2 mobile), text-4xl 2.25rem (H2/H1 mobile), text-5xl 3rem (H1 desktop).
- Editorial body column: 620px (not ch-based; Inter ch exceeds average glyph width).

## 3. Spacing

- 8pt scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Section rhythm: --spacing-section 5rem.
- Fixed-overlay clearance: the navbar (80px) and the ImpactMarquee band (fixed top-[80px], ~33px tall) float over page content. Any section that begins at the top of the viewport needs >=160px top padding below lg (hero uses pt-40); at lg+ the hero's 85vh vertical centering provides the clearance. Never compensate by padding <main> - the overlays are out of flow and main padding creates a white gap on full-bleed heroes.
- Warm neutral layer: cream (--ftf-cream) and sand (--ftf-sand) sit alongside the cool paper layer (bg-primary/bg-secondary/bg-tertiary). Do NOT replace the cool layer - both coexist.
- Section rhythm alternation (Phase 12 Step 3): no two adjacent sections may share a background. Cream is the page baseline; sand is the accent band placed between two creams; bg-surface (white) appears occasionally for contained, card-heavy sections; navy (bg-primary) dark bands are reserved for emphasis moments - stat strips, testimonials, final CTAs, the Village block and partner blocks. Alternate roughly every 1-2 sections. SectionWrapper is the single implementation: background="cream | sand | white | navy | gradient" plus the §8 entrance reveal (opacity 0→1 + translateY 16→0, 400ms, once, reduced-motion instant). Reference rhythm (Home): cream hero → sand trust strip → white stats → cream pillars → sand journey → white featured → navy village → cream stories → sand founder quote → white partners → cream priorities → navy closing CTA → sand newsletter. Interior pages open on cream after a dark or photo hero and close on a navy or sand CTA band. Never raw hex - tokens only.
- Container widths: body 620px, wide 1200px, full 1440px.
- Radii: --radius-card 1rem (cards, panels), --radius-button 0.5rem (form controls); shared Button renders pill (rounded-full).

## 4. Components

- Buttons (`src/components/ui/Button.tsx`, pill shape, sizes sm/md/lg):
  - primary: bg-cta + text-on-cta (dark green/white light, bright green/near-black dark)
  - secondary: bg-primary + text-text-on-primary (blue trust action)
  - outline: border-2 border-border, hover border-primary + bg-bg-tertiary
  - ghost: text-text-secondary, hover bg-bg-tertiary
  - tertiary/text link: LearnMoreLink (accent-hover text + arrow)
  - destructive: error-token inline pattern (border-error/text-error or bg-error bg-error/10); no shared variant yet - do not invent one without approval
- Cards (Phase 12 Step 4 unified treatment; shared classes in `src/lib/ui/cardClasses.ts`):
  - Single surface treatment: `rounded-2xl` (= --radius-card), `border border-border`, `bg-surface`, resting `shadow-sm`, hover `bg-surface-hover` + `shadow-md`; focus-visible via the global :focus-visible ring (§1 System). Spread `cardClasses` on the card root and pick padding from `cardPadding` = compact p-6 / default p-7 / feature p-8.
  - Motion: NO transform greater than 2px on cards - hover is a background + shadow change only, never a lift (see §8).
  - Sanctioned variants: (a) default = cardClasses as-is; (b) semantic tint = ValueCard only, keeps its tinted border/bg (7-value colour discipline) but adopts the same radius, padding and hover shadow; (c) dashed empty-state = border-dashed, no hover; (d) media tile = ImpactGallery frame, rounded-2xl bg-bg-tertiary, no border; (e) semantic tint-border = how-we-work principle cards, keep the per-principle tinted border on bg-surface with resting shadow-sm + hover bg-surface-hover/shadow-md (no lift).
  - Consumers: ProgrammeCard, ValueCard, story cards (news/nigeria), report cards, partner logo tiles + partner cards, our-work pillar/country cards, impact metric/indicator cards, give route/project cards (/give), homepage pillar/story/priority cards, about explore cards, safeguarding commitment cards, how-we-work principle cards, team/governance person cards, volunteer role cards, get-involved route cards, impact-store product cards. TrustChips is a chip strip on the sand band, not a card.
- Chips: pillar chips (pillar-N accent or bg-accent-subtle + text-accent-text), category chips on news (bg-story-tag + text-story-tag-text), status pills (status-active/pilot/archived/campaign), trust chips (border-trust-border + trust-icon).
- Forms: label text-xs font-semibold uppercase tracking-wider text-text-tertiary; input rounded-xl border-border-strong bg-surface py-3 px-4 text-sm, focus:border-accent + focus:ring-2 ring-accent/20; error alert rounded-xl border-error/20 bg-error/10 text-error; help text text-xs text-text-muted.
- Navigation: Navbar (sticky desktop header + ThemeToggle), MobileMenu (right-side drawer, 56px rows, active row green left border), Footer (blue bg-primary band in both themes, white scoped override, link columns + contact).
- Editorial hero (split): homepage hero is a `<section class="bg-cream">` with a `lg:grid-cols-[3fr_2fr]` (~60/40) grid. The left column is LCP-critical and fully static in SSR - plain tertiary eyebrow, Playfair H1 `clamp(2.5rem,6vw,5rem)` / lh 1.02 / -0.02em, 55ch subhead, an equal-height 56px CTA pair (filled `bg-cta` + blue `border-2 border-primary` outline), then a divider above trust microcopy. No entrance motion on the text column. Below lg the grid stacks (text -> full-width card) and the section carries `pt-40` for fixed-overlay clearance (see §3). Hero background is `--ftf-cream`; the TrustChips strip directly below sits on `--ftf-sand`.
- Campaign card with progress: an `<aside>` on `bg-surface`, `border border-border`, `rounded-2xl`, `shadow-xl shadow-primary/5`, padding `p-6` (`sm:p-8`). Contents: a 4:3 photo clipped to `--radius-card`, an uppercase muted label, Playfair `tabular-nums` figures sourced from `siteConfig.donation` (never hard-coded), a progressbar with track `bg-journey-track` + fill `bg-accent` (`h-2.5 rounded-full`, `role="progressbar"` with `aria-valuenow/min/max` + `aria-label`), a muted "% of goal" line, and a full-width `h-12 bg-cta` CTA. The card is the hero's ONLY entrance motion: opacity 0->1 + y 16->0, 400ms ease-out, `whileInView` once (`margin: -80px`); instant under prefers-reduced-motion (§8).

## 5. Anti-patterns (BANNED)

- Full-screen blue mobile overlay
- Count-up animations from 0
- Rotating hero carousels
- "underprivileged" / "less privileged" / "poor children" (enforced by check:banned-language)
- "initiatives" as nav label
- Pity-led imagery
- Full legal names for minors
- Raw hex in JSX (`text-[#...]`, `bg-[#...]`, inline style with hex)
- New color hues beyond the brand palette
- Drop caps
- Social share counts

## 6. Accessibility

- WCAG AA minimum (4.5:1 body, 3:1 large text). Measured pairs: CTA light 4.78:1 / dark 8.3:1; blue primary + white 4.9:1.
- Focus rings on all interactive elements via :focus-visible + --ftf-focus-ring.
- Alt text on all images; safeguarding-safe (non-identifying) alt/captions for programme photography.
- Semantic HTML (article, header, nav, main); skip-to-content link.
- Respect prefers-reduced-motion (global media query collapses animations/transitions).

## 7. Change log

- 2026-09-21 - Design system lock established (Phase 11.5). Token table captured verbatim from globals.css; check-design-tokens CI gate added; AGENTS.md rewritten. No token values changed.
- 2026-09-21 - Site-wide copy sweep: em dashes (—) replaced with hyphens (-) in source and DB content.
- 2026-09-21 - White brand lockup re-uploaded to Cloudinary (ftf/images/misc/ftf-logo-white, v1790007291); footer + supporter-login brand panel now use it.
- 2026-09-21 - Decision 1: token-check violations cleared - confetti + fundAllocation hexes moved to the shared `src/lib/chartColors.ts` map (theme-aware `var()` references); error boundary and theme-color meta literals carry documented `design-tokens-exempt` markers.
- 2026-09-21 - §8 Motion guidelines added (Phase 12 Step 1 / C3): entrance, scroll-linked, celebration, carousel and micro-interaction patterns with mandatory reduced-motion fallbacks. No token changes.
- 2026-09-21 - Warm neutral layer added (--ftf-cream #FAF7F1 / --ftf-sand #EFE9DD light; #16181A / #1E2124 dark) as additive background tokens alongside the cool paper layer; §1 table + §3 coexistence note updated. No existing token values changed.
- 2026-09-21 - Phase 12 Step 2 (A1, revised): homepage hero rebuilt as a Givra-style split editorial hero (60/40) on --ftf-cream with a --ftf-sand trust strip. Left column static/LCP-safe (Playfair clamp H1, 55ch subhead, equal-height 56px CTA pair); right column is a campaign `<aside>` card showing FTF Village Phase One progress (GH₵125,000 of GH₵500,000 = 25%) sourced from siteConfig.donation, with a journey-track/accent progressbar (full ARIA) and card-only whileInView reveal (400ms, reduced-motion instant). V1 floating stat card + radial gradient removed. Two reusable patterns codified in §4 (Editorial hero split; Campaign card with progress). References supplied craft only - FTF palette, typography and content retained.
- 2026-09-21 - Phase 12 Step 3 (A3): section rhythm alternation applied site-wide (15 page clients). SectionWrapper gains cream/sand backgrounds plus the §8 fade-rise entrance reveal; §3 alternation rule codified (cream baseline, sand accent, white contained, navy emphasis bands, no adjacent repeats). Homepage village block and /impact/ftf-at-10 timeline now use watermark-free Cloudinary crops of the Village render (c_crop transforms in src/lib/imageUrl.ts) pending a clean render from the founder.
- 2026-09-21 - Phase 12 Step 4 (A2): card system unified. New --ftf-shadow-sm / --ftf-shadow-md tokens (blue-tinted in light, neutral in dark) mapped onto Tailwind shadow-sm / shadow-md via @theme inline; shared cardClasses + cardPadding exported from src/lib/ui/cardClasses.ts; every card surface adopts rounded-2xl + border-border + bg-surface + resting shadow-sm + hover bg-surface-hover/shadow-md with no transform >2px; ValueCard semantic tint preserved as a documented variant; ImpactGallery tiles rounded-xl -> rounded-2xl. §4 Card pattern codified.
- 2026-09-22 - Phase 12 Step 4.5: legacy card sweep. The remaining card surfaces still on the old 4px-lift treatment (homepage pillar/story/priority, about explore, safeguarding, how-we-work, team/governance, volunteer, get-involved, impact-store, give) now spread cardClasses + cardPadding; how-we-work per-principle tint border documented as sanctioned variant (e); the orphaned /initiatives route (fully 308-redirected to /our-work) was deleted. No token changes.
- Earlier - CTA pair introduced (bg-cta/text-on-cta) replacing mid accent green button backgrounds (AA failure).
- Earlier - Layer 3 dark-mode palette remaps + scoped footer white override added.

## 8. Motion

Normative. All animation on the site must fit a pattern below; new patterns require the same approval as any other change to this document.

### Principles

- Motion serves meaning: it reveals structure, shows progress, or rewards completion. Never decoration for its own sake.
- Content is fully readable the moment its section is visible - animation must never gate comprehension.
- LCP safety: hero and above-the-fold text render immediately with no opacity/transform entrance. Entrance animations apply to below-the-fold content only (a Framer Motion opacity entrance on the LCP element is a known past regression).
- Brand tone: calm and confident. No bounce/elastic overshoot on institutional surfaces; playful easing is reserved for celebration moments.

### Allowed patterns

| Pattern | Use | Spec |
| --- | --- | --- |
| Entrance reveal | sections, cards, list items | opacity 0→1 + translateY 12-16px→0, 300-500ms, `whileInView` with `viewport={{ once: true, margin: "-80px" }}`; item stagger ≤ 60ms, max ~10 animated items per section |
| Scroll-linked fill | journey progress, fund-allocation bars | width/scaleX tied to the containing section's scroll progress, rAF-throttled; final state is the exact token value (no overshoot) |
| Celebration | donation/payment success | confetti burst using `confettiColors` from `src/lib/chartColors.ts`, one-shot, total ≤ 3s; sequenced reveal (check → receipt) |
| Carousel/swipe | approved swipe surfaces only | snap points, 200-300ms slide, user-driven only (drag/arrow/dot); indicators in muted tokens |

> **Carousel/swipe status:** No carousel or swipe surface currently exists on the site. This pattern is documented for future use only. Any new carousel/swipe implementation requires brief-level approval per §4 component changes.
| Micro-interaction | hover/press/focus on buttons, cards, links | CSS transitions 150-250ms on color/background/box-shadow; transform shifts ≤ 2px |

### Rules

- Library: Framer Motion for entrance/scroll-linked/celebration; CSS transitions for micro-interactions.
- Durations: micro 150-250ms; entrance 300-500ms; celebration ≤ 3s; scroll-linked has no fixed duration (tied to scroll).
- Easing: ease-out for entrances, ease-in for exits; springs only for celebration (damping ≥ 20, no repeated oscillation).
- Animate transform/opacity wherever possible; width/height only for bars and fills.
- Entrances use `once: true` - no replay on re-scroll (exception: explicit progress indicators).

### Reduced motion (mandatory)

- The global `prefers-reduced-motion` media query in globals.css collapses CSS animations/transitions.
- Any JS-driven motion (Framer entrance, scroll-linked fill, confetti) must additionally check `matchMedia("(prefers-reduced-motion: reduce)")` and render the final state immediately: bars at final width, no confetti, no slide animation, content visible.

### Banned motion

- Count-up animations from 0 (numbers render final immediately).
- Rotating/autoplay hero carousels.
- Full-screen blue mobile overlay.
- Parallax background layers.
- Infinite looping animation on content surfaces (existing exception: the ImpactMarquee band, which collapses under reduced motion).
- Entrance animation on the LCP element.
