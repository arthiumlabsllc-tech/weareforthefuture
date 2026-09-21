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

## Session continuity

Handoff files are kept OUTSIDE the repo at the workspace root:

- ../SESSION-HANDOFF.md
- ../PHASE-12-CONTINUITY.md

Reason: they contain internal sequencing and founder feedback that isn't for public consumption. New agents should ask the user for these before proceeding.

## Installed Agent Skills

The following Qoder Skills are bound to this project's workspace. They live outside
the repo at `../.qoder/skills/`, junctioned to a CLI-managed store at
`../.agents/skills/`:

- ftf-design-system (custom, v1.0.0) - FTF design rules: locked tokens, typography,
  section rhythm, motion, banned anti-patterns. AUTHORITATIVE. Its source of truth
  is committed in-repo at `ftf-design-system/` (SKILL.md + examples/hero-reference.md
  + .qoder-plugin/ + PROVENANCE.md); the workspace junction only exposes it.
- frontend-design - production-grade UI direction and on-screen content discipline
- ui-craft - visual design craft and anti-generic-UI rules, plus the installed
  passes: critique, audit, polish, animate, adapt, unhappy, harden, extract, typeset
- design-system-governance - design system contribution, versioning and deprecation governance
- interaction-design - micro-interactions, component states, feedback, response time
- accessibility-catalogue (router) with fixing-accessibility and wcag-22 - WCAG 2.2
  audits, ARIA/keyboard/focus/contrast remediation, conformance docs

Agents should confirm these are active before starting UI work: the skill appears in
the session's available-skills list, or `../.qoder/skills/<name>/SKILL.md` resolves.

Precedence: `ftf-design-system` and DESIGN.md outrank every generic design skill.
Those skills supply method - reviews, audits, checklists, craft rigour. They never
supply brand decisions: no new hues, no aesthetic anchors or theme presets, no
foreign typefaces, and no parallel design context (`.ui-craft/` briefs or token
spines). When one suggests a palette or theme of its own, use its structure and
FTF tokens.

Upstream provenance, licenses, the ui-craft passes deliberately left out and the
reinstall/update commands are recorded in `ftf-design-system/PROVENANCE.md`.

## Probe file hygiene

Never leave probe/test/scratch files in the repo. Any file named `*probe*`,
`*scratch*`, `*test-fix*`, or dropped into `src/` for a one-off verification must be:

1. Written to a temp dir OUTSIDE `src/` (preferred - e.g. `scripts/dev/`, which is
   already gitignored), OR
2. Deleted immediately after use, verified with `git status`.

Before every commit, `git status` must show only intentional source changes. The
`.gitignore` carries `*-probe*.tsx`, `*-scratch*.tsx` and `*-test-fix*.tsx` as a
backstop, but that is a safety net - it is not a licence to leave scratch files on
disk. `git ls-files | Select-String "probe"` must return nothing.

## Non-negotiables

- Follow DESIGN.md for every UI decision
- No new colors beyond the brand palette
- No raw hex in JSX. Use design tokens.
- No banned language. Run `npm run check:banned-language` before committing.
- No hard-coded content that's on the CMS-editable list (brief §21)
- Wrap every Prisma call in page.tsx / layout.tsx with try/catch → fallback
- Prefer ISR over Dynamic for DB-backed routes

## Before making ANY change

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
