---
name: ftf-design-system
description: Apply the FTF design system to every UI decision. Use when building or reviewing any UI component, page, or visual element for the FTF website.
version: 1.0.0
---

# FTF Design System Skill

## When to use

Every UI task on the FTF website. Read `DESIGN.md` at the repo root for the full
system. This skill is the agent-side summary.

Source of truth for token values is `src/app/globals.css` (Layer 1 `:root` /
`[data-theme="dark"]` custom properties, Layer 2 Tailwind `@theme inline`, Layer 3
dark-mode remaps). If this file, DESIGN.md and globals.css disagree, globals.css
wins and the documents get corrected with a changelog entry.

**Precedence over other design skills.** See the `## Precedence` section below:
this skill and DESIGN.md outrank every generic design skill installed on the
project.

## Precedence

If a generic design skill (`frontend-design`, `ui-craft` and its passes,
`interaction-design`, `wcag-22`, `fixing-accessibility`,
`design-system-governance`) conflicts with this skill, THIS SKILL WINS. The FTF
design system (DESIGN.md + this skill) is authoritative. Specifically:

- Do NOT use `frontend-design`'s aesthetic anchor system (Brutalist, Cyberpunk,
  Nordic, Vaporwave, Organic, Luxury, Industrial). FTF's aesthetic is locked to
  the design system - warm institutional editorial, cream/sand, Playfair Display
  + Inter, blue trust / green CTA. Use that skill's rigour (deliberate visual
  direction, token discipline, on-screen strings that name real information),
  never its anchor or palette invention.
- Do NOT use `ui-craft` presets or passes that lock a new palette or typeface
  (`ui-craft-minimal`, `ui-craft-editorial`, `ui-craft-dense-dashboard`,
  `colorize`, `craft`, `shape`, `redesign`). Those are deliberately not
  installed; FTF bans new hues and foreign typefaces.
- Do NOT let any skill write a parallel design context (e.g. a `.ui-craft/`
  brief, a token spine, its own CI gates) that competes with DESIGN.md. FTF
  already has DESIGN.md + AGENTS.md + `check-design-tokens` +
  `check:banned-language` as the single source of truth; two contexts would drift.

Those skills supply craft method, review rigour and audit checklists - never
brand decisions. When one suggests a colour, font or theme of its own, FTF tokens
win and the suggestion is used for structure only.

## Brand colors (locked - no new hues)

| Colour | Light / Dark | Token + utility | Use |
| --- | --- | --- | --- |
| Primary blue | `#3973B8` / `#3973B8` | `--ftf-primary`, `bg-primary`, `text-primary` | trust surfaces, links, info, secondary buttons - never the primary CTA |
| Green accent | `#4CB64D` / `#6FCB70` | `--ftf-accent`, `bg-accent` | progress fills, icons, chips ONLY - **banned as a button background** (~2.5:1 with white) |
| CTA pair | `#2E7D32` + `#FFFFFF` / `#6FCB70` + `#16181A` | `bg-cta` + `text-on-cta`, hover `bg-cta-hover` | the only green button pattern (4.78:1 light, 8.3:1 dark) |
| Green text | `#2E7D32` / `#8FD890` | `--ftf-accent-text`, `text-accent-text` | green text and text-link arrows on light/dark |
| Charcoal | `#333333` headings, `#494949` body / `#F2F4F5`, `#C6CBCF` | `text-text-primary`, `text-text-secondary` | structure, body copy, dark sections |
| Cream | `#FAF7F1` / `#16181A` | `--ftf-cream`, `bg-cream` | warm page baseline |
| Sand | `#EFE9DD` / `#1E2124` | `--ftf-sand`, `bg-sand` | alternate section between two creams |
| Surface / border | `#FFFFFF` / `#1E2124`, `#E2E6E9` / `#33383C` | `bg-surface`, `border-border` | cards, inputs, hairlines |

Semantic pairs also exist for success / warning / error / info, trust chips,
pillar accents (`--ftf-pillar-1..5`), impact numerals, journey track/fill, story
and report cards, and status pills - all tabulated in DESIGN.md §1. Ask before
adding any token: `globals.css` changes require explicit approval.

## Typography

- Display: Playfair Display (`--font-display`, applied as
  `font-[family-name:var(--font-display)]`) - H1, H2, pull quotes, hero display lines.
- Body: Inter (`--font-sans`) - body, UI, links, labels. Body line-height 1.7.
- Scale in use: `text-xs` eyebrows/labels/meta, `text-sm` UI, `text-base` body,
  `text-lg` lede, `text-2xl` H3, `text-3xl` H2 mobile, `text-4xl` H2/H1 mobile,
  `text-5xl` H1 desktop. Hero H1: `clamp(2.5rem,6vw,5rem)`, leading 1.02,
  tracking -0.02em.
- Editorial body column is **620px**, not `ch`-based (Inter `ch` exceeds average
  glyph width).
- Figures and stats use `tabular-nums`.

## Layout and rhythm

- No two adjacent sections share a background. Cream is the baseline; sand is the
  accent band between two creams; `bg-surface` (white) for contained, card-heavy
  sections; navy (`bg-primary`) reserved for emphasis - stat strips,
  testimonials, final CTAs, the Village block, partner blocks.
- `SectionWrapper` (`src/components/ui/SectionWrapper.tsx`) is the single
  implementation: `background="cream | sand | white | navy | gradient"` plus the
  §8 entrance reveal. Do not hand-roll section backgrounds.
- 8pt spacing scale (4, 8, 12, 16, 24, 32, 48, 64, 96); section spacing
  `var(--spacing-section)` = 5rem; radii `--radius-card` 1rem,
  `--radius-button` 0.5rem (shared `Button` renders pill).
- Fixed overlays: navbar 80px + ImpactMarquee ~33px float over content. A
  section starting at the top of the viewport needs >=160px top padding below
  `lg` (hero uses `pt-40`). Never pad `<main>` - it creates a white gap on
  full-bleed heroes.
- Containers: body 620px, wide 1200px, full 1440px.

## Motion (DESIGN.md §8)

- Entrance reveal: opacity 0→1 + translateY 12-16px→0, 300-500ms, `whileInView`
  with `viewport={{ once: true, margin: "-80px" }}`, stagger <=60ms, <=10
  animated items per section.
- Micro-interactions: CSS transitions 150-250ms on colour/background/shadow;
  transform shifts <=2px.
- Scroll-linked fills tie to section scroll progress, rAF-throttled, ending on
  the exact token value.
- **Never animate the hero H1 or any LCP element.** JS-driven motion must check
  `matchMedia("(prefers-reduced-motion: reduce)")` and render the final state
  immediately.
- Banned motion: count-up from 0, rotating/autoplay carousels, parallax layers,
  full-screen blue mobile overlay, infinite loops on content surfaces, entrance
  animation on the LCP element.

## Anti-patterns (BANNED)

- Full-screen blue mobile overlay
- Count-up animations from 0
- Rotating hero carousels
- "underprivileged" / "less privileged" / "poor children"
- "initiatives" as a nav label
- Pity-led imagery
- Full legal names for minors
- Raw hex in JSX (`text-[#...]`, `bg-[#...]`, inline `style` hex)
- New hues beyond the brand palette
- Drop caps
- Social share counts

## Workflow

1. Read `DESIGN.md` before any UI change (and `AGENTS.md` for project rules).
2. Check for existing components and tokens before inventing: `src/components/ui/*`
   (`Button`, `SectionWrapper`, `SectionHeader`, `TrustChips`, `StatDisplay`,
   `ValueCard`, `ProgrammeCard`), `src/lib/chartColors.ts`, `src/lib/imageUrl.ts`.
3. Use tokens, never raw hex. Chart and decorative palettes come from the shared
   theme-aware map in `src/lib/chartColors.ts`. Inline styles must reference
   `--ftf-*` names - the `--color-*` aliases are tree-shaken when only used from
   inline style strings.
4. Extract craft from references, never skin. Givra (primary), LoveLift (rhythm)
   and Charity (structure) are craft references; their palettes and typefaces are
   not candidates.
5. Verify both themes. The Tailwind `white` utility inverts to the dark surface
   (Layer 3); surfaces that stay constant (e.g. the blue footer band) need
   `text-text-on-primary` or the existing scoped override.
6. Before commit, from `ftf-website/`:
   `npm run check-design-tokens`, `npm run check:banned-language`
   (or `npm run prebuild`, which runs both), `npx tsc --noEmit`, `npm run build`.
7. Screenshot visual changes at 1440 in light and dark, and confirm no
   horizontal overflow at 375. Stop and report after each approved step.

## Pitfalls

- Don't invent new colors "for variety" - ask first; `globals.css` is
  approval-gated.
- Don't copy reference palettes (LoveLift / Charity / Givra are craft references,
  not skin references).
- Don't add motion on LCP elements.
- Don't ship watermarked or placeholder imagery, identifiable minors, or full
  legal names for minors. Programme photography needs safeguarding-safe alt text.
- Sand (`#EFE9DD`) fails AA for `text-tertiary`, `text-muted` and `accent-text`
  in light mode. `globals.css` carries a scoped
  `[data-theme="light"] .bg-sand` override for those tokens - do not remove it,
  and re-measure contrast when adding muted text to a sand band.
- Legacy Tailwind palettes (`navy-*`, `gold-*`, `emerald-*`, `coral-*`) exist
  only so old classes keep resolving; new code uses semantic tokens.
- Full-page screenshots never fire `whileInView` reveals - scroll the page
  through first or below-fold sections photograph at opacity 0.
- After `npm run build`, restart `next start`: a server booted on the previous
  build 404s new chunks and pages render blank.

## Reference: hero example

See `examples/hero-reference.md` for the approved split editorial hero pattern
(Phase 12 Step 2) - structure, exact classes, the campaign card with its ARIA
progressbar, motion constraints and the verification numbers it must hold.
