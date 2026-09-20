import { prisma } from "@/lib/db";

/**
 * Resolve a list of pillar slugs into ProgramPillar link rows for a programme.
 * The lowest pillar number is treated as the primary pillar (matches the seed
 * convention). Returns:
 *  - undefined when `slugs` is undefined (caller should leave links untouched),
 *  - [] when an empty list is passed (explicitly clear all links),
 *  - otherwise the link rows ordered by pillar number.
 */
export async function resolvePillarLinks(
  slugs: string[] | undefined,
): Promise<{ pillarId: string; isPrimary: boolean; order: number }[] | undefined> {
  if (!slugs) return undefined;
  if (slugs.length === 0) return [];
  const found = await prisma.pillar.findMany({
    where: { slug: { in: slugs }, published: true, deletedAt: null },
    select: { id: true, number: true },
  });
  return found
    .sort((a, b) => a.number - b.number)
    .map((pillar, i) => ({ pillarId: pillar.id, isPrimary: i === 0, order: pillar.number }));
}
