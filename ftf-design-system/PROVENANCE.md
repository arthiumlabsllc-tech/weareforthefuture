# Installed Agent Skills - provenance and curation

Workspace: `d:\Arthium Labs LLC\FTF` (the git repository is the `ftf-website`
subdirectory; this workspace root is not a repository).

Installed 2026-09-21 for the FTF website rebuild (Phase 12).

## Layout

```
ftf-website/ftf-design-system/   THIS package - FTF-authored skill, committed to the repo
  SKILL.md                       the skill (root-level: also the plugin skill entry)
  examples/hero-reference.md     approved hero pattern reference
  .qoder-plugin/plugin.json      Qoder plugin manifest
  PROVENANCE.md                  this file
  README.md                      package overview

<workspace>/.agents/skills/<name>/   canonical store for third-party skills (skills.sh CLI)
<workspace>/.qoder/skills/<name>     junction -> canonical store (what Qoder discovers)
<workspace>/.qoder/skills/ftf-design-system   junction -> ftf-website/ftf-design-system
<workspace>/skills-lock.json         CLI lockfile for the third-party skills
```

`<workspace>` is `d:\Arthium Labs LLC\FTF`; the git repository is its
`ftf-website` subdirectory, so everything under `<workspace>/.qoder/` and
`<workspace>/.agents/` is local workspace config that lives OUTSIDE the repo and
is never committed. Only `ftf-website/ftf-design-system/` travels with the code.

`.qoder/skills/` holds skill folders only - no loose files - so the discovery
scan never sees a directory without a `SKILL.md`.

Third-party skills are CLI-managed so they can be updated:

```
npx skills list                 # what is installed
npx skills update <name>        # refresh one
npx skills remove <name>        # remove one
```

`ftf-design-system` is FTF-authored and lives in the repository (versioned,
travels with the code); the junction only makes it visible to this workspace.
`npx skills remove --all` will not touch it, but it will remove the junctions -
recreate them with `New-Item -ItemType Junction`.

## Third-party skills

| Skill | Upstream | Catalogue tier | License | Files |
| --- | --- | --- | --- | --- |
| frontend-design | Ilm-Alan/frontend-design | experimental | MIT (LICENSE.txt bundled) | 3 |
| design-system-governance | Owl-Listener/designer-skills | community | not declared in package | 1 |
| interaction-design | rastian/interaction-design-skills | community | not declared in package | 6 |
| ui-craft (+ 9 curated passes) | educlopez/ui-craft | experimental | not declared in package | 35 (core) |
| accessibility-catalogue | podo/design-agent-skills (router) | official | not declared in package | 2 |
| fixing-accessibility | ibelick/ui-skills | community | not declared in package | 1 |
| wcag-22 | Raze-Systems/wcag-ai-skill @ `9c460e4` | community | **AGPL-3.0** | 21 |

Catalogue: [podo/design-agent-skills](https://github.com/podo/design-agent-skills)
(151 skills; entries are pointers that resolve to the upstream repos above).

### Redistribution warning

Do not vendor these into the FTF repository or into any distributed plugin
without checking upstream licenses first. `wcag-22` is **AGPL-3.0** (copyleft)
and must never be bundled into a distributed artifact. The only redistributable
package built here is `qoder-skill-packages/ftf-design-system-1.0.0.zip`, which
contains FTF-authored content only.

### Two upstream quirks worth knowing

- `Raze-Systems/wcag-ai-skill` cannot be checked out on Windows: the repo
  committed NTFS alternate-data-stream files (`*.md:Zone.Identifier`), which are
  illegal Windows filenames, so `npx skills add`, `git checkout`, `git archive`
  and sparse checkout all fail on it. `wcag-22` was extracted blob-by-blob from
  commit `9c460e4` (byte-exact, ADS files dropped). `npx skills update` will not
  be able to refresh it; to re-extract, `git clone --no-checkout` the upstream,
  then for each path under `.agents/skills/wcag-2.2/` (skipping any
  `*Zone.Identifier`) run `git cat-file blob HEAD:<path>` and stream the bytes to
  the matching file under `.agents/skills/wcag-22/` via
  `[System.Diagnostics.Process]` + `[System.IO.File]::Create` (a plain PowerShell
  pipe corrupts binary bytes). Its folder was renamed `wcag-2.2` -> `wcag-22` to
  match its frontmatter `name`.
- The catalogue entry `accessibility-catalogue` is a **router**, not an
  implementation: on its own it only tells the agent which other skill to fetch.
  `fixing-accessibility` (ARIA, keyboard, focus, contrast fixes) and `wcag-22`
  (WCAG 2.2 criteria, audits, conformance docs) were installed alongside it so
  the capability actually exists locally.

## ui-craft curation

`educlopez/ui-craft` is a suite of ~30 skills: a core skill plus one skill per
slash-command pass, organised in four "rungs" (Ask / Direct / Persist / Enforce).
Installed: the core plus the review-and-refine passes that operate inside an
existing locked system.

Installed: `ui-craft` (core), `critique`, `audit`, `polish`, `animate`, `adapt`,
`unhappy`, `harden`, `extract`, `typeset`.

Deliberately **not** installed, with reasons:

| Excluded | Why |
| --- | --- |
| `brief`, `tokens`, `remember`, `sddesign`, `start`, `finalize` | Rungs 2-3: they write a parallel design context (`.ui-craft/brief.md`, a token spine, CI gates). FTF already has DESIGN.md, AGENTS.md, `check-design-tokens` and `check:banned-language` as the single source of truth. Two contexts would drift. |
| `ui-craft-minimal`, `ui-craft-editorial`, `ui-craft-dense-dashboard` | Presets that lock foreign palettes and typefaces (Monochrome + Geist, IBM Plex). Directly conflicts with the locked FTF palette and Playfair/Inter. |
| `colorize` | Its job is introducing a new accent colour. FTF bans new hues. |
| `craft`, `shape`, `redesign` | Generate a theme/composition from scratch. Useful for greenfield, wrong for a locked system; FTF's own reference-driven workflow covers composition. |
| `friction-log` | Files GitHub issues through an external cloud agent. Out of scope for this project. |
| `bolder`, `quieter`, `delight`, `distill`, `clarify`, `heuristic` | Overlap the installed passes; kept out to keep the skill namespace tight. |

Any of these is one command away, e.g.
`npx skills add educlopez/ui-craft --skill heuristic -y` (run from the workspace
root so the Qoder junction is created).

Because only a subset is installed, `ui-craft`'s own SKILL.md mentions commands
(`/brief`, `/tokens`, `/finalize`, `/sddesign`) that do not exist here. Treat
those references as unavailable, not as failures.

## frontend-design fit warning

Upstream `frontend-design` works by picking one of eight "aesthetic anchors"
(Brutalist, Nordic, Cyberpunk, Vaporwave, Organic, Luxury, Editorial,
Industrial) and explicitly advises leaning unexpected. FTF's system is locked,
so that step is **already resolved** for this project: the anchor is warm
institutional editorial (cream/sand, Playfair Display + Inter, blue trust /
green CTA tokens). Use the skill's rigour - deliberate visual direction, token
discipline, and its rule that on-screen strings name real information rather
than fabricated demo data - and never its palette or anchor invention.

`ftf-design-system` carries this precedence rule so it applies even when an
agent loads only that skill.

## Safety review

All installed content is Markdown/YAML/SVG text. Verified before wiring in:

- no scripts, binaries or executables (extensions present: `.md`, `.yaml`,
  `.txt`, `.svg`, `.json` only)
- no network calls, no credential or `.env` access, no destructive commands
- no prompt-injection patterns ("ignore previous instructions", hidden
  instructions to the agent)
- the only matches for sensitive keywords are WCAG guidance about password
  managers, paste and accessible authentication (3.3.8), which is the point of
  the skill

The catalogue's own risk assessment flagged `frontend-design` as high risk on
one scanner (Gen) with one Socket alert; the fetched content was reviewed and
contains design guidance only. Every other installed skill was assessed
`Safe / 0 alerts / Low Risk` at install time. Skills run with full agent
permissions - re-review after any `npx skills update`.
