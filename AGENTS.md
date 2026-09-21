<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos, the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` - verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Instructions - FTF Website

You are working on the For The Future Organization website. Before touching anything, read these files IN ORDER:

1. AGENTS.md (this file)
2. DESIGN.md - the design system, non-negotiable
3. BRIEF-AUDIT.md - current brief coverage (if it exists)
4. The FTF 2026-2031 website brief

## Non-negotiables

- Follow DESIGN.md for every UI decision
- No new colors beyond the brand palette
- No raw hex in JSX. Use design tokens.
- No banned language. Run `npm run check:banned-language` before committing.
- No hard-coded content that's on the CMS-editable list (brief §21)
- Wrap every Prisma call in page.tsx / layout.tsx with try/catch → fallback
- Prefer ISR over Dynamic for DB-backed routes

## Before making changes

1. Read the relevant brief section for your task
2. Check BRIEF-AUDIT.md for known gaps
3. Search for existing components before creating new ones
4. Check if a token already exists before adding one

## When uncertain

Ask the user. Do not guess on brief interpretation. Report any deviation with rationale in the commit message.

## Editorial conventions

- Use hyphens (-) instead of em dashes (—) in all site content,
  including source code, CMS content (BlogPost, Pillar, LegalPage,
  Document, DonationCampaign), and any new copy.
- Reason: consistent typographic style across the site. Approved
  by the project owner.
- If you encounter an em dash in code or content, replace it with
  a hyphen as part of your change.

## Commit conventions

- feat: / fix: / chore: / refactor: / docs:
- Include brief §-ref when applicable
- Example: `feat(§6.3): five-pillar grid on homepage`

## Before every commit

- [ ] DESIGN.md respected
- [ ] No banned language (npm run check:banned-language)
- [ ] No raw hex (npm run check-design-tokens)
- [ ] tsc clean
- [ ] next build clean
- [ ] Screenshots attached for UI changes

## Files requiring explicit approval to edit

- src/app/globals.css - token definitions
- next.config.ts - redirects
- prisma/schema.prisma - requires migration
- src/data/site.ts - single source of truth
- src/data/pillars.ts - pillar definitions
- src/data/impact.ts - verified impact figures
- DESIGN.md - any change requires user approval + changelog entry
