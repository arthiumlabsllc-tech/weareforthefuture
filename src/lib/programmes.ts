import { cache } from "react";
import type { Initiative } from "@/data/initiatives";
import { prisma } from "@/lib/db";
import { programMetricsSchema } from "@/lib/programme-content";

export const getPublicProgrammes = cache(async (): Promise<Initiative[]> => {
  const programs = await prisma.program.findMany({
    where: { published: true, deletedAt: null },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { slug: true, name: true, shortDescription: true, image: true, impactMetrics: true, createdAt: true },
  });
  return programs.map((program) => {
    const parsed = programMetricsSchema.safeParse(program.impactMetrics);
    const metrics = parsed.success ? parsed.data : {};
    return {
      slug: program.slug,
      title: program.name,
      shortDescription: program.shortDescription || "",
      fullDescription: "",
      image: program.image,
      category: metrics.category || "Humanitarian",
      country: metrics.country || "Ghana",
      year: metrics.year || program.createdAt.getFullYear(),
      beneficiaries: metrics.beneficiaries ?? null,
      status: metrics.status || "active",
      highlights: metrics.highlights || [],
      pillars: metrics.pillars || [],
      featured: metrics.featured || false,
      href: metrics.detail ? `/initiatives/${encodeURIComponent(program.slug)}` : undefined,
    };
  });
});

export const getPublicProgramme = cache(async (slug: string) => {
  const program = await prisma.program.findFirst({ where: { slug, published: true, deletedAt: null } });
  if (!program) return null;
  const parsed = programMetricsSchema.safeParse(program.impactMetrics);
  if (!parsed.success || !parsed.data.detail) return null;
  return { ...program, metrics: parsed.data, detail: parsed.data.detail };
});
