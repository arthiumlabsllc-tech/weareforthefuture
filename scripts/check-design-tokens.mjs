/**
 * check-design-tokens - CI gate for the FTF design system lock (Phase 11.5).
 *
 * Scans src/** for raw hex colour literals that bypass the token system:
 *   - arbitrary Tailwind colour classes: text-[#...], bg-[#...], border-[#...], ...
 *   - inline style objects containing hex: style={{ color: '#fff' }}
 *   - hex colour props: color="#fff", fill="#fff", stroke="#fff", ...
 *   - bare hex string literals in TS/TSX ("#3973B8")
 *
 * Token definitions in src/app/globals.css are the only place hex may live.
 * Exits 1 and prints file:line + snippet when violations exist.
 *
 * Run: npm run check-design-tokens
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");

const HEX = "(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})";

const PATTERNS = [
  {
    name: "arbitrary Tailwind hex class",
    re: new RegExp(`\\b(text|bg|border|ring|fill|stroke|from|via|to|outline|decoration|caret|accent|shadow)-\\[#${HEX}\\]`, "g"),
  },
  {
    name: "inline style hex",
    re: new RegExp(`style=\\{\\{[^}\\n]*#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\\b`, "g"),
  },
  {
    name: "hex colour prop",
    re: new RegExp(`\\b(color|fill|stroke|stopColor|floodColor|lightingColor|backgroundColor)\\s*=\\s*["']#${HEX}["']`, "g"),
  },
  {
    name: "bare hex literal",
    re: new RegExp(`["']#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6})["']`, "g"),
  },
];

function listFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(p, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function isCommentLine(line) {
  const t = line.trim();
  return t.startsWith("//") || t.startsWith("*") || t.startsWith("/*");
}

const violations = [];
const files = listFiles(SRC);

for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (isCommentLine(line)) return;
    // Documented exemptions: lines carrying the design-tokens-exempt marker
    // (error boundary inline styles, theme-color meta literals).
    if (line.includes("design-tokens-exempt")) return;
    for (const { name, re } of PATTERNS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        violations.push({
          file: path.relative(ROOT, file).split(path.sep).join("/"),
          line: i + 1,
          kind: name,
          snippet: line.trim().slice(0, 100),
        });
      }
    }
  });
}

if (violations.length === 0) {
  console.log(`✅ check-design-tokens: no raw hex colours in src/ (${files.length} files scanned)`);
  process.exit(0);
}

console.log(`❌ ${violations.length} violation${violations.length === 1 ? "" : "s"} found:`);
for (const v of violations) {
  console.log(`  ${v.file}:${v.line} - ${v.kind}: ${v.snippet}`);
}
console.log("\nUse design tokens from src/app/globals.css instead of raw hex (see DESIGN.md §1).");
process.exit(1);
