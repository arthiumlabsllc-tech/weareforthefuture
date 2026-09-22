# FTF Design System

Last updated: 2026-09-22
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

### Exception: Campaign card with progress

The FTF Village campaign card (HomeClient L162, DonateClient L272) is intentionally elevated with shadow-xl shadow-primary/5 and is documented as an exception to the card system. Its visual weight reflects its role as a featured donation CTA. Do NOT unify it with other cards.

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
- 2026-09-22 - Phase 12 Step 5 (C2): JourneyStepper now shares one responsive ordered list on the homepage and /our-work. Transform-only fill, passive rAF scroll updates (minimum 16ms), cached geometry, 150ms debounced resize and full observer/frame/listener cleanup replace the 1.2s time-based draw. User-approved visible-sequence deviation: desktop progresses while the whole row is visible, activating nodes at fill milestones (horizontal nodes share one viewport height, so independent 50%-viewport observers would activate together); mobile fill and per-node IntersectionObservers follow node centers through 50% viewport height, with catch-up for restored scroll/fast jumps. Reached nodes stay active. Filled nodes use journey-node-active with the existing dark selection-text ink; no new tokens. A11y: one `<ol>`, seven `<h3>` headings prefixed "Step N of 7:", one `aria-current="step"` frontier, descriptions remain accessible. Reduced-motion and no-JS render all content and full fill; reduced-motion CSS forces zero transitions immediately. Campaign-card exception recorded in §4; campaign surfaces unchanged.
- 2026-09-22 - Step 5 performance profile accepted and recorded in §8: headless rAF sampling baseline, accepted mobile dropped-frame markers, and a like-for-like ~100fps investigation threshold under 4× CPU throttle. No further optimization without measurable cause.
- 2026-09-22 - Phase 12 Step 6 (A4, brief §11.1): fund-allocation fills on /impact, /impact/reports and /give now use the §8 entrance-reveal variant below: one IntersectionObserver per allocation group at threshold 0.25, 700ms ease-out scaleX growth and 80ms row stagger, no scroll handlers. Percentages remain static and sourced from fundAllocation/chartColors. Added progressbar category/value semantics; reduced-motion renders final widths immediately with zero transition or delay, including live preference changes. Removed Reports' competing per-row slide/fade. Campaign progress bars and tokens unchanged.
- 2026-09-22 - Phase 12 Step 7 (C1, brief §6.9): /donate/success now has a warm cream confirmation, unified feature receipt card and verified-donation-only 2s celebration. Replaced 80 DOM particles and nested springs with 44 canvas particles and four ease-out CSS reveals. Added session replay prevention, immediate reduced-motion state, live cancellation, persistent polite success status, heading focus and keyboard-safe public-link sharing. Store/pending/error states remain static; verification requests abort on unmount/reference changes. Receipt now uses verified currency, full wrapping reference and first-name-only personalization; email/tax copy avoids unverified delivery or blanket tax claims. §8 celebration contract updated; no API, token or shared palette changes.
- 2026-09-22 - Step 7 scope clarification: celebration rewards donations only; store receipts, volunteer confirmations and partner inquiry confirmations remain static. Explicit boundary added to §8; no implementation changes.
- 2026-09-22 - Phase 12 Step 7b (brief §10.8): added the FTF Book Club subsection to /impact-store after How It Works and before the final CTA. Cream separates the surface overview from the navy CTA in both themes. Reuses SectionWrapper's one-shot 400ms entrance with an immediate reduced-motion final state, Playfair/Inter, cardClasses + compact padding for six semantic activity-list cards, and decorative Lucide book artwork (no minor imagery). The Join CTA uses the existing /contact route with explanatory copy; that form has no topic-prefill support, so no inert query parameter or out-of-scope form change was added. Existing store copy/catalog/cart/checkout are unchanged; no new patterns or tokens.
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
| Scroll-linked progress | journey steppers and progress indicators tied to scroll position | Transform-only `scaleX` / `scaleY`, origin left/top, clamped 0..1. Passive rAF-throttled updates (minimum 16ms), cached measurements and 150ms debounced resize; cancel frames, timers, observers and listeners on unmount. Exact final token fill (`--ftf-journey-fill` over `--ftf-journey-track`), no overshoot or time-based draw. Node changes are 300ms color/opacity only; reached nodes stay active. Reduced-motion: 100% fill and all nodes active instantly, zero transitions. |
| Celebration | verified donation success only | one-shot check → confetti → receipt → thank-you → actions; total ≤ 2.5s; `confettiColors`, ≤1500ms burst, ≤50 particles; see Celebration pattern below |
| Carousel/swipe | approved swipe surfaces only | snap points, 200-300ms slide, user-driven only (drag/arrow/dot); indicators in muted tokens |

> **Carousel/swipe status:** No carousel or swipe surface currently exists on the site. This pattern is documented for future use only. Any new carousel/swipe implementation requires brief-level approval per §4 component changes.
| Micro-interaction | hover/press/focus on buttons, cards, links | CSS transitions 150-250ms on color/background/box-shadow; transform shifts ≤ 2px |

Journey timing (approved visible sequence): desktop 0% when the complete row clears the viewport bottom by 24px, 100% when its top reaches 160px (fixed-header clearance); node milestones follow the fill. Mobile 0%/100% when the first/last node centers cross the viewport midpoint; each node has a half-viewport IntersectionObserver. A geometry-based catch-up handles fast jumps/restored positions. Fill reverses on scroll-up; reached nodes do not. No pinning, count-ups or changes to native scrolling.

#### Reference performance profile

Verified headless (rAF sampling, no long tasks):
- Desktop: 144fps
- Mobile: 143fps
- Mobile with 4× CPU throttling: 123fps

Minor dropped-frame markers observed on throttled mobile during fast scroll - accepted. Scroll-linked transforms on mobile inherently drop occasional frames; the profile above maintains 2× headroom over 60fps under throttle. Do NOT over-optimize below this point without measurable cause.

If a future change regresses below ~100fps under 4× throttle, investigate.

Measurement note: these are rAF sampling rates in an approximately 144Hz headless environment, not rendered-frame rates or physical-device 60fps certification. The 2× comparison and ~100fps regression threshold apply only to like-for-like sampling. Dropped-frame markers also occurred on unthrottled mobile; occasional drops are accepted for this profile, not an unavoidable property of every mobile transform.

#### Fund-allocation entrance reveal (Step 6)

A specific entrance-reveal variant, not continuous scroll-linked progress: observe the allocation group with `IntersectionObserver({ threshold: 0.25 })`, then disconnect after its first qualifying intersection. Set each fill's layout width from `fundAllocation.percentage` and animate only `scaleX(0)` → `scaleX(1)` from the left, 700ms ease-out with 80ms stagger (six bars, 1.1s total). This approved variant uses a 600-800ms duration budget and ~80ms stagger instead of the generic entrance timings. Colors remain the theme-aware `chartColors` references carried by `fundAllocation`; no count-ups, opacity gates, scroll listeners or per-frame React updates. Each track exposes `role="progressbar"`, category label and final `aria-valuenow/min/max`; labels and percentages stay readable throughout. Reduced-motion CSS immediately forces final transforms with zero transition/delay, backed by a live `matchMedia` check. Disconnect observers and remove media-query listeners on unmount; unsupported observers fall back to final fills. No replay on scroll-up or preference toggles.

### Celebration scope

The celebration sequence (Step 7) applies ONLY to the donation success page. Store receipts, volunteer confirmations, and partner inquiry confirmations remain static. The celebration rewards the emotional act of giving - not every transaction.

### Celebration pattern (success moments)

Used only on the donation success page (`/donate/success`), after the server verifies a successful donation. This is the only page where confetti is allowed; the shared store callback stays static. Sequence, measured from verified receipt mount:

- 0ms: warm cream shell, success H1 and explanatory text visible; all final layout space reserved. The shell's generic entrance is locally suppressed; the H1 never animates.
- 200ms: verified check animates scale 0.8 → 1 and opacity 0 → 1 (300ms ease-out), independently at the receipt's top edge.
- 500ms: optional brand-palette canvas burst (≤1500ms, ≤50 particles; implementation: 44), behind and clipped away from the receipt text, decorative and pointer-transparent.
- 700ms: receipt card reveals from 16px below (400ms ease-out), using `cardClasses` + `cardPadding.feature`. This entrance is an explicit exception to the card transform limit, not a hover lift.
- 1200ms: separate Playfair thank-you message fades in (300ms).
- 1800ms: CTA row appears (200ms); keyboard focus reveals it immediately.

Total runtime: ≤2.5s (implementation: 2s). Native CSS keyframes handle the four reveals; a single DPR-aware canvas and rAF chain handle confetti, with timer/frame/resize-observer cleanup. Confetti uses `confettiColors` from `src/lib/chartColors.ts`, filtered to the existing green, blue, charcoal and accent-bright entries; no new hues or shared palette changes.

Reduced-motion: the entire sequence is skipped, all content at final state immediately, no mounted canvas/particles and no confetti color resolution. Live preference changes cancel the sequence without replay. A sessionStorage flag (`ftf:donation-celebration:v1`, value `1`, no personal data) is claimed only after verification, including reduced-motion visits; refreshes and subsequent donations in the same tab session stay static. Unavailable storage also falls back to static. Pending, failed and store callbacks never consume the flag.

Success uses a persistent polite live region and focuses the visible H1 without scrolling. All actions are keyboard-accessible. Share copies the current origin's public `/give` URL, never the private callback reference; clipboard denial exposes a labeled, selectable link field.

### Rules

- Library: Framer Motion for entrance; native CSS keyframes + canvas/rAF for the donation celebration; native passive rAF + IntersectionObserver for the journey's scroll-linked progress; IntersectionObserver + CSS transitions for fund-allocation entrance reveals; CSS transitions for micro-interactions.
- Durations: micro 150-250ms; entrance 300-500ms (fund-allocation variant 600-800ms); celebration ≤ 2.5s; scroll-linked has no fixed duration (tied to scroll).
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
