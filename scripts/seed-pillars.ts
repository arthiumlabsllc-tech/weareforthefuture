/**
 * Phase 3b.2 seed - pillars, programme↔pillar links, featured/status flags.
 *
 * Idempotent: safe to re-run. Upserts the five pillars from src/data/pillars.ts
 * (single source of truth for copy), creates a ProgramPillar row for each
 * existing programme's inferred primary pillar, and marks the four
 * brief-featured programmes plus non-operational statuses.
 *
 * Run: npx tsx scripts/seed-pillars.ts   (requires a reachable DATABASE_URL)
 */
import { PrismaClient } from "@prisma/client";
import { pillars } from "../src/data/pillars";

const prisma = new PrismaClient();

/* lucide icon component -> stored icon NAME (Pillar.icon is a String). */
const ICON_NAME: Record<string, string> = {
  "foundational-education": "BookOpen",
  "girls-education-dignity": "Flower2",
  "future-ready-skills": "Laptop",
  "mentorship-leadership": "Compass",
  "community-family-support": "HeartHandshake",
};

/* Brand-semantic accent token per pillar (decorative metadata only; the visual
   accent bar uses the always-emitted --ftf-pillar-N custom property). */
const ACCENT: Record<number, string> = {
  1: "primary",
  2: "accent",
  3: "primary",
  4: "accent",
  5: "charcoal",
};

/* programme slug -> primary pillar slug (inferred from each programme's model). */
const PROGRAM_PILLAR: Record<string, string> = {
  "step-project": "foundational-education",
  "smart-start-initiative": "foundational-education",
  "sponsor-a-child": "foundational-education",
  "empower-her-period": "girls-education-dignity",
  "click-4-change": "future-ready-skills",
  "future-pathways": "future-ready-skills",
  "project-momentum": "future-ready-skills",
  "ftf-chess-in-slums": "mentorship-leadership",
  "share-aid-initiative": "community-family-support",
  "ftf-village-project": "community-family-support",
};

/* The four brief-featured programmes shown on the homepage featured-work rail.
   Note: `smart-start-initiative` is the consolidated "Foundational Learning /
   Learning Clubs" row (see CONSOLIDATED below) - brief 10.2 retires SmartStart
   as an isolated programme, so it is featured under its learning-clubs name. */
const FEATURED = [
  "step-project",
  "smart-start-initiative",
  "future-pathways",
  "empower-her-period",
];

/* Brief 10.2 - SmartStart must NOT remain an isolated programme: it consolidates
   under Foundational Learning / Learning Clubs. We rename the legacy row (slug
   kept for URL stability so inbound links and the sitemap stay valid) and reuse
   the site's already-approved learning-clubs copy. After this no row is named
   SmartStart, so nothing SmartStart-branded can be featured. */
const CONSOLIDATED = {
  slug: "smart-start-initiative",
  name: "Foundational Learning / Learning Clubs",
  shortDescription:
    "Literacy, numeracy and Saturday learning clubs that help children catch up, keep up and stay in school with confidence.",
};

/* Non-operational / lifecycle statuses (default is "active"). */
const STATUS: Record<string, string> = {
  "ftf-village-project": "future_project",
};

async function main() {
  // 1. Pillars
  for (const pillar of pillars) {
    await prisma.pillar.upsert({
      where: { slug: pillar.id },
      update: {
        number: pillar.number,
        title: pillar.title,
        summary: pillar.summary,
        challenge: pillar.challenge,
        whatWeDo: pillar.whatWeDo,
        whoItServes: pillar.whoItServes,
        whereItWorks: pillar.whereItWorks,
        icon: ICON_NAME[pillar.id] ?? null,
        accent: ACCENT[pillar.number] ?? null,
        order: pillar.number,
        published: true,
        deletedAt: null,
      },
      create: {
        number: pillar.number,
        title: pillar.title,
        slug: pillar.id,
        summary: pillar.summary,
        challenge: pillar.challenge,
        whatWeDo: pillar.whatWeDo,
        whoItServes: pillar.whoItServes,
        whereItWorks: pillar.whereItWorks,
        icon: ICON_NAME[pillar.id] ?? null,
        accent: ACCENT[pillar.number] ?? null,
        order: pillar.number,
        published: true,
      },
    });
    console.log(`pillar upserted: ${pillar.number} ${pillar.id}`);
  }

  // 2. Programme <-> primary pillar links
  const pillarBySlug = new Map(
    (await prisma.pillar.findMany()).map((p) => [p.slug, p] as const),
  );
  for (const [programSlug, pillarSlug] of Object.entries(PROGRAM_PILLAR)) {
    const program = await prisma.program.findUnique({ where: { slug: programSlug } });
    const pillar = pillarBySlug.get(pillarSlug);
    if (!program || !pillar) {
      console.warn(`skip link (missing row): ${programSlug} -> ${pillarSlug}`);
      continue;
    }
    await prisma.programPillar.upsert({
      where: { programId_pillarId: { programId: program.id, pillarId: pillar.id } },
      update: { isPrimary: true, order: pillar.number },
      create: { programId: program.id, pillarId: pillar.id, isPrimary: true, order: pillar.number },
    });
    console.log(`linked: ${programSlug} -> ${pillarSlug} (primary)`);
  }

  // 3. Featured + status flags
  // 3a. Retire the isolated SmartStart brand: unfeature it, then consolidate
  //     (rename) the row into the brief's learning-clubs programme.
  const retired = await prisma.program.updateMany({
    where: { OR: [{ name: { contains: "Smart Start" } }, { slug: CONSOLIDATED.slug }] },
    data: { isFeatured: false },
  });
  console.log(`unfeatured legacy SmartStart row(s): ${retired.count}`);
  const consolidated = await prisma.program.updateMany({
    where: { slug: CONSOLIDATED.slug },
    data: { name: CONSOLIDATED.name, shortDescription: CONSOLIDATED.shortDescription },
  });
  console.log(`consolidated ${CONSOLIDATED.slug} -> "${CONSOLIDATED.name}" (${consolidated.count} row(s))`);

  // 3b. Feature the four brief-mandated programmes.
  for (const slug of FEATURED) {
    const r = await prisma.program.updateMany({ where: { slug }, data: { isFeatured: true } });
    console.log(`featured: ${slug} (${r.count} row(s))`);
  }
  for (const [slug, status] of Object.entries(STATUS)) {
    const r = await prisma.program.updateMany({ where: { slug }, data: { status } });
    console.log(`status: ${slug} = ${status} (${r.count} row(s))`);
  }

  const summary = await prisma.programPillar.count();
  console.log(`done. ProgramPillar rows: ${summary}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
