# FTF Design System (Qoder plugin)

Packages the For The Future (FTF) design system as a Qoder Agent Skill so every
agent working on the FTF website applies the locked brand tokens, typography,
section rhythm, motion rules and banned anti-patterns without re-deriving them.

## What it does

`ftf-design-system` activates on any UI task for the FTF website - building or
reviewing a component, page, section or visual element. It supplies:

- the locked brand palette with token names, light **and** dark values, and the
  Tailwind utilities that map to them
- typography rules (Playfair Display / Inter, scale, 620px editorial column)
- section rhythm and layout rules (cream baseline, sand accent, navy emphasis,
  no adjacent repeats, `SectionWrapper` as the single implementation)
- motion rules from DESIGN.md §8, including the LCP and reduced-motion bans
- the banned anti-pattern list (mirrors `check:banned-language` and
  `check-design-tokens`, the project's CI gates)
- a worked reference: `examples/hero-reference.md`, the approved split editorial
  hero with its verification numbers

It also states precedence: when a generic design skill suggests its own palette,
aesthetic anchor, preset or token spine, FTF tokens win.

## Provenance

- Author: Arthium Labs LLC (FTF web team). FTF-authored, no upstream third-party
  content bundled.
- Derived from `DESIGN.md` and `src/app/globals.css` in
  [arthiumlabsllc-tech/weareforthefuture](https://github.com/arthiumlabsllc-tech/weareforthefuture)
  at commit `da38734` (branch `feature/repositioning-2026`), 2026-09-21.
- Canonical source of this skill lives in the repository at
  `ftf-website/ftf-design-system/` (this folder). It is both the committed source
  of truth and the Qoder plugin root; the workspace discovers it through a
  junction at `<workspace>/.qoder/skills/ftf-design-system`. Regenerate the
  distributable zip after any DESIGN.md change rather than hand-editing the zip.
- Logo: none declared (no `logo` field in the manifest).

## Included

| Path | Purpose |
| --- | --- |
| `SKILL.md` | the skill (frontmatter `name`, `description`, `version`) - root-level, so this folder is both the plugin root and the discoverable skill |
| `examples/hero-reference.md` | approved hero pattern reference |
| `.qoder-plugin/plugin.json` | Qoder plugin manifest (`"skills": "./SKILL.md"`) |
| `PROVENANCE.md` | installed third-party skills: upstreams, licenses, curation, safety review |
| `README.md` | this file |

Omitted: none. No scripts, hooks, MCP servers, rules, agents or commands are
declared - this plugin ships skill content only.

## Setup

Install into a workspace so Qoder discovers it. With the Qoder CLI available:

```
qodercli plugin install --scope project <path-to-this-plugin>
```

Without it (the FTF workspace uses this route), place the skill folder directly
in the workspace's project skill directory - a junction to the repository copy
keeps a single source of truth:

```
<workspace>/.qoder/skills/ftf-design-system/SKILL.md
<workspace>/.qoder/skills/ftf-design-system/examples/hero-reference.md
```

Confirm activation: the skill appears in the session's available-skills list,
and `<workspace>/.qoder/skills/ftf-design-system/SKILL.md` resolves. Agents
should confirm it is active before starting UI work (see `AGENTS.md`,
"Installed Agent Skills").

## Validation

- `python scripts/validate_qoder_plugin.py <plugin-root>` (bundled offline
  validator from Qoder's `create-plugin` skill): **OK: no issues found**.
- Same validator run against the packaged zip: see the command output recorded
  in the FTF session report.
- Frontmatter carries `name` and `description`; all manifest paths start with
  `./`, stay inside the plugin root, and exist.
