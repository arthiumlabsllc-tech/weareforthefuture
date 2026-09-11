import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import ImpactStoreClient from "./ImpactStoreClient";

export const metadata: Metadata = {
  title: "Impact Store",
  description:
    "Shop with purpose. Support underprivileged children while shopping for everyday essentials. 100% of proceeds fund our life-changing programs.",
};

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function ImpactStorePage() {
  const products = await prisma.product.findMany({
    where: { status: "active", deletedAt: null },
    include: { category: true },
    orderBy: { order: "asc" },
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
