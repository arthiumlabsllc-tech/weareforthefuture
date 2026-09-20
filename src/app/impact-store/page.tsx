import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import ImpactStoreClient from "./ImpactStoreClient";

export const metadata: Metadata = {
  title: "Impact Store",
  description:
    "Shop with purpose. Support vulnerable children and young people while shopping for everyday essentials. 100% of proceeds fund our life-changing programmes.",
  alternates: { canonical: "/impact-store" },
};

const prisma = new PrismaClient();

// Phase 3b.2 ISR audit: the store catalogue is CMS-managed content that does not
// need per-request freshness — statically generate + revalidate instead of λ.
// (The /impact-store/checkout child route stays interactive via useSearchParams.)
export const revalidate = 300;

export default async function ImpactStorePage() {
  // Guarded: fall back to an empty list if the DB is unreachable (Phase 3a.5).
  const products = await prisma.product.findMany({
    where: { status: "active", deletedAt: null },
    include: { category: true },
    orderBy: { order: "asc" },
  }).catch((err) => {
    console.error("[/impact-store] DB query failed:", err);
    return [];
  });

  const dbProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price / 100, // pesewas to GHS
    image: (p.images as string[])?.[0] || "/images/store/default.png",
    category: p.category?.name || "General",
    impact: p.impactStatement || "",
    description: p.shortDescription || p.description || "",
    badge: p.badge || undefined,
  }));

  // Build categories from products
  const catSet = new Set(dbProducts.map((p) => p.category));
  const categories = ["All", ...Array.from(catSet)];

  return <ImpactStoreClient initialProducts={dbProducts} initialCategories={categories} />;
}
