# Approved hero pattern: split editorial hero + campaign card

Reference implementation: `src/app/HomeClient.tsx` (homepage hero, Phase 12
Step 2). Codified in `DESIGN.md` §4 as two reusable patterns - "Editorial hero
(split)" and "Campaign card with progress". Craft extracted from the Givra
reference; FTF palette, type and content retained.

## Why this pattern

- The left column is the LCP element and is **fully static in SSR** - no opacity
  or transform entrance. A Framer Motion opacity entrance on the LCP element is
  a known past regression on this project.
- A split (roughly 60/40) grid gives the page an editorial voice plus one live,
  data-backed object (the campaign card) instead of a decorative full-bleed
  image or a rotating carousel (both banned).
- Warm cream background with a sand trust strip directly below establishes the
  page baseline and the first rhythm alternation (see DESIGN.md §3).

## Anatomy

```
<section class="bg-cream">                          page baseline, warm
  <div class="grid ... lg:grid-cols-[3fr_2fr]">     ~60/40 split at lg
    LEFT  (static, LCP-critical)
      eyebrow     text-xs uppercase tracking-[0.2em] text-text-tertiary + bg-accent dot
      H1          Playfair, clamp(2.5rem,6vw,5rem), leading-[1.02], tracking-[-0.02em]
      subhead     max-w-[55ch] text-lg sm:text-xl text-text-secondary
      CTA pair    two h-14 buttons, equal height: filled bg-cta + blue border-2 border-primary
      divider     border-t border-border, then muted trust microcopy
    RIGHT (the only entrance motion)
      <aside>     bg-surface border border-border rounded-2xl shadow-xl shadow-primary/5 p-6 sm:p-8
        photo     aspect-[4/3] rounded-[var(--radius-card)], next/image fill priority
        label     text-xs uppercase tracking-[0.2em] text-text-muted
        figures   Playfair tabular-nums, values from siteConfig.donation (never hard-coded)
        progress  role="progressbar" + aria-valuenow/min/max + aria-label,
                  track bg-journey-track, fill bg-accent, h-2.5 rounded-full
        meta      "{n}% of goal" in text-text-muted
        CTA       full-width h-12 bg-cta text-on-cta
  </div>
</section>
<TrustChips />                                      sand strip immediately below
```

## Overlay clearance

The navbar (80px) and the fixed ImpactMarquee band (~33px, `top-[80px]`) float
over content. The hero carries `pt-40` below `lg`; at `lg` the `min-h-[85vh]`
vertical centring provides the clearance. Never compensate by padding `<main>`.

## Motion constraints

```tsx
const reduceMotion = useReducedMotion();

<motion.aside
  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
/>
```

- Card only. The text column has no entrance animation.
- 400ms ease-out, fires once, reduced-motion renders the final state instantly.
- The progress fill is a static width from data - no count-up, no scroll-linked
  animation on this card.

## Content and imagery rules

- Figures come from `siteConfig.donation` so the card cannot drift from the
  Village section below it.
- Imagery: dignified, no watermark, no identifiable minors, warm palette, and
  safeguarding-safe alt text. The current hero photo is
  `img("/images/misc/bento-1.png")` with `priority` and explicit `sizes`.
- Never ship placeholder or watermarked renders. Watermark-free Cloudinary crops
  live in `src/lib/imageUrl.ts` as first-class keys.
- Copy obeys `check:banned-language`: no "underprivileged", "less privileged",
  "poor children", no pity-led framing, no full legal names for minors.

## Verification numbers this hero must hold

| Check | Expected |
| --- | --- |
| Photo aspect ratio | 1.333 (4:3) |
| Photo corner radius | 16px (`--radius-card`) |
| CLS on load | 0 |
| Grid stacked at 375 / 768 | true |
| Grid split at 1440 | false (two columns) |
| LCP element entrance motion | none |
| Raw hex in the hero markup | none (`npm run check-design-tokens`) |
| Dark theme | cream -> `#16181A`, card -> `#1E2124`, CTA pair 8.3:1 |

Capture with the project's CDP harness (`scripts/dev/`, gitignored) at 1440 and
375, light and dark. Scroll the page before any full-page capture or
`whileInView` sections photograph at opacity 0.

## Adapting it to another page

Interior pages keep a dark or photo hero, then open on cream and close on a navy
or sand CTA band (DESIGN.md §3). Reuse the split only where a live data object
exists to show; otherwise use `SectionWrapper background="cream"` with a
`SectionHeader`. Do not invent a third hero variant without approval.
