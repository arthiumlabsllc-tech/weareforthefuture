import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("pages.edit");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const d = await req.json();
  const item = await prisma.testimonial.update({
    where: { id },
    data: {
      ...(d.quote !== undefined && { quote: d.quote }),
      ...(d.author !== undefined && { author: d.author }),
      ...(d.role !== undefined && { role: d.role || null }),
      ...(d.image !== undefined && { image: d.image || null }),
      ...(d.order !== undefined && { order: Number(d.order) }),
      ...(d.published !== undefined && { published: d.published }),
      updatedBy: auth.session.userId,
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("pages.edit");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.testimonial.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
