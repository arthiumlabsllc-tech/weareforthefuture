/**
 * Banned-language CI check (Phase 5 Step 0c).
 *
 * Scans src/, scripts/ and prisma/ for legacy language that violates the FTF
 * brief. Exits non-zero if any occurrence is found, so `npm run build` fails
 * before a violation can ship. Cross-platform (pure Node, no grep dependency).
 *
 * The two files that legitimately contain these words as replacement patterns
 * (this checker and the DB sweep script) are excluded.
 *
 * Run:  npm run check:banned   (also wired into `build`)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["src", "scripts", "prisma"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const EXCLUDE_FILES = new Set([
  join("scripts", "check-banned-language.mjs"),
  join("scripts", "sweep-legacy-copy.ts"),
]);

/** Brief-banned legacy language. Use brief-aligned alternatives instead. */
const BANNED = [
  { re: /\bunderprivileged\b/gi, label: "underprivileged" },
  { re: /\bless privileged\b/gi, label: "less privileged" },
  { re: /\bpoor children\b/gi, label: "poor children" },
  { re: /\bneedy\b/gi, label: "needy" },
  { re: /\bless fortunate\b/gi, label: "less fortunate" },
  { re: /\bthird world\b/gi, label: "third world" },
  { re: /\bdeveloping world\b/gi, label: "developing world" },
  { re: /\bsaviou?r\b/gi, label: "savior/saviour" },
  { re: /\bhelpless\b/gi, label: "helpless" },
  { re: /\bhandout\b/gi, label: "handout" },
  { re: /\bevery dollar\b/gi, label: "every dollar" },
  { re: /90%\s*(?:to|goes to|of every)\b/gi, label: "90% to programs" },
];

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      yield* walk(full);
    } else if (EXTENSIONS.has(extname(entry))) {
      yield full;
    }
  }
}

const findings = [];
for (const d of SCAN_DIRS) {
  for (const file of walk(join(ROOT, d))) {
    const rel = relative(ROOT, file);
    if (EXCLUDE_FILES.has(rel)) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const { re, label } of BANNED) {
        re.lastIndex = 0;
        if (re.test(line)) {
          findings.push(`${rel}:${i + 1}: [${label}] ${line.trim().slice(0, 140)}`);
        }
      }
    });
  }
}

if (findings.length > 0) {
  console.error("\n\u2716 Banned legacy language detected (brief violation):");
  for (const f of findings) console.error("  " + f);
  console.error(`\n${findings.length} occurrence(s). Replace with brief-aligned language:`);
  console.error('  "vulnerable" / "underserved" / "children and young people facing disadvantage"');
  console.error("For DB rows already seeded, run: npx tsx scripts/sweep-legacy-copy.ts\n");
  process.exit(1);
}

console.log("\u2713 check-banned-language: clean (no banned legacy language in src/, scripts/, prisma/).");
