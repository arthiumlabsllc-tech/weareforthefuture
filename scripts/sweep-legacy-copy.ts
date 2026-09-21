/**
 * One-off legacy-copy sweep (Phase 5 Step 0b).
 *
 * Finds rows whose human-readable text still contains banned legacy language
 * (seeded before the Phase 2.5 brief alignment) and replaces it with
 * brief-aligned wording, in a single transaction, logging before/after per row.
 *
 * Scope: Program (name / shortDescription / description / impactMetrics) and
 * SiteSetting (value) - the two DB surfaces seeded from the old copy.
 *
 * Run:  npx tsx scripts/sweep-legacy-copy.ts
 * Safe to re-run: rows with no banned language are left untouched.
 */
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/** Ordered replacement rules (longest phrases first so they win over the catch-all). */
const RULES: Array<[RegExp, string]> = [
  [/underprivileged children/gi, "vulnerable children"],
  [/underprivileged youth/gi, "underserved youth"],
  [/underprivileged families/gi, "vulnerable families"],
  [/underprivileged communities/gi, "underserved communities"],
  [/underprivileged/gi, "vulnerable"],
  [/less privileged/gi, "underserved"],
  [/poor children/gi, "children facing disadvantage"],
];

const HAS_BANNED = /underprivileged|less privileged|poor children/i;

function sweepText(input: string | null | undefined): string | null {
  if (input == null) return null;
  let out = input;
  for (const [re, replacement] of RULES) out = out.replace(re, replacement);
  return out;
}

function hasBanned(input: string | null | undefined): boolean {
  return input != null && HAS_BANNED.test(input);
}

async function main() {
  let changedRows = 0;
  const ops: Prisma.PrismaPromise<unknown>[] = [];

  // ── Program rows ────────────────────────────────────────────────────────
  const programs = await prisma.program.findMany({ orderBy: { order: "asc" } });
  for (const p of programs) {
    const name = sweepText(p.name) ?? p.name;
    const shortDescription = sweepText(p.shortDescription);
    const description = sweepText(p.description) ?? p.description;

    let impactMetrics = p.impactMetrics;
    let metricsChanged = false;
    if (p.impactMetrics != null) {
      const serialized = JSON.stringify(p.impactMetrics);
      if (hasBanned(serialized)) {
        impactMetrics = JSON.parse(sweepText(serialized) ?? serialized);
        metricsChanged = true;
      }
    }

    const nameChanged = name !== p.name;
    const shortChanged = (shortDescription ?? null) !== (p.shortDescription ?? null);
    const descChanged = description !== p.description;

    if (!nameChanged && !shortChanged && !descChanged && !metricsChanged) continue;

    changedRows += 1;
    console.log(`\n[Program ${p.id}] "${p.name}" (slug: ${p.slug})`);
    if (nameChanged) console.log(`  name:  "${p.name}"  ->  "${name}"`);
    if (shortChanged) {
      console.log(`  shortDescription:\n    before: ${JSON.stringify(p.shortDescription)}\n    after:  ${JSON.stringify(shortDescription)}`);
    }
    if (descChanged) {
      console.log(`  description:\n    before: ${JSON.stringify(p.description)}\n    after:  ${JSON.stringify(description)}`);
    }
    if (metricsChanged) {
      console.log(`  impactMetrics:\n    before: ${JSON.stringify(p.impactMetrics)}\n    after:  ${JSON.stringify(impactMetrics)}`);
    }

    const data: Prisma.ProgramUpdateInput = {};
    if (nameChanged) data.name = name;
    if (shortChanged) data.shortDescription = shortDescription;
    if (descChanged) data.description = description;
    if (metricsChanged) data.impactMetrics = impactMetrics as Prisma.InputJsonValue;

    ops.push(prisma.program.update({ where: { id: p.id }, data }));
  }

  // ── SiteSetting values (Json column; only sweep string values) ──────────
  const settings = await prisma.siteSetting.findMany();
  for (const s of settings) {
    if (typeof s.value !== "string" || !hasBanned(s.value)) continue;
    const next = sweepText(s.value);
    if (next == null || next === s.value) continue;
    changedRows += 1;
    console.log(`\n[SiteSetting ${s.id}] key="${s.key}"`);
    console.log(`  value:\n    before: ${JSON.stringify(s.value)}\n    after:  ${JSON.stringify(next)}`);
    ops.push(prisma.siteSetting.update({ where: { id: s.id }, data: { value: next } }));
  }

  if (ops.length === 0) {
    console.log("No rows contained banned legacy language. Nothing to do.");
    return;
  }

  await prisma.$transaction(ops);
  console.log(`\nSwept ${changedRows} row(s) in a single transaction.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("sweep-legacy-copy failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
