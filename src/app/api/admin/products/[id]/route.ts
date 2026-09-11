import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("products.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const d = await req.json();
  const data: Record<string, unknown> = { updatedBy: auth.session.userId };
  for (const key of ["name","slug","description","shortDescription","impactStatement","sku","badge","status"]) {
    if (d[key] !== undefined) data[key] = d[key] || null;
  }
  for (const key of ["price","compareAtPrice","stock","weight"]) {
    if (d[key] !== undefined) data[key] = d[key] !== null ? Number(d[key]) : null;
  }
  if (d.images !== undefined) data.images = d.images;
  if (d.categoryId !== undefined) {
    data.category = d.categoryId ? { connect: { id: d.categoryId } } : { disconnect: true };
  }
  const item = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("products.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
