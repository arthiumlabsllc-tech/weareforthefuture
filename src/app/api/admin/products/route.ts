import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdmin("products.manage");
  if ("error" in auth) return auth.error;
  const items = await prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { category: true },
  });
  const categories = await prisma.category.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });
  return NextResponse.json({ items, categories });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin("products.manage");
  if ("error" in auth) return auth.error;
  const d = await req.json();
  const item = await prisma.product.create({
    data: {
      name: d.name, slug: d.slug, description: d.description || null,
      shortDescription: d.shortDescription || null, impactStatement: d.impactStatement || null,
      price: Number(d.price) || 0, compareAtPrice: d.compareAtPrice ? Number(d.compareAtPrice) : null,
      sku: d.sku || null, stock: Number(d.stock) || 0,
      weight: d.weight ? Number(d.weight) : null,
      badge: d.badge || null, status: d.status || "draft",
      images: d.images || [],
      ...(d.categoryId ? { category: { connect: { id: d.categoryId } } } : {}),
      createdBy: auth.session.userId, updatedBy: auth.session.userId,
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}
