import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import InitiativesClient from "./InitiativesClient";

export const metadata: Metadata = {
  title: "Our Initiatives",
  description:
    "Explore the programs and initiatives run by For The Future Organization to empower underprivileged children across Ghana, Nigeria, and the US.",
};

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function InitiativesPage() {
  const programs = await prisma.program.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { order: "asc" },
  });

  const dbInitiatives = programs.map((p) => {
    const metrics = (p.impactMetrics || {}) as Record<string, unknown>;
    return {
      slug: p.slug,
      title: p.name,
      shortDescription: p.shortDescription || "",
      fullDescription: p.description,
      category: (metrics.category as string) || "Humanitarian",
      country: (metrics.country as string) || "Ghana",
      year: (metrics.year as number) || new Date().getFullYear(),
      image: p.image || "/images/initiatives/default.jpg",
      beneficiaries: (metrics.beneficiaries as number) || 0,
      status: (metrics.status as "active" | "completed" | "upcoming") || "active",
      highlights: (metrics.highlights as string[]) || [],
    };
  });

  // Build categories from programs
  const catSet = new Set(dbInitiatives.map((p) => p.category));
  const categories = ["All", ...Array.from(catSet)];

  return <InitiativesClient initialInitiatives={dbInitiatives} initialCategories={categories} />;
}
