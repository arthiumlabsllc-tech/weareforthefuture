import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("pages.edit");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const d = await req.json();
  const item = await prisma.impactStat.update({
    where: { id },
    data: {
      ...(d.label !== undefined && { label: d.label }),
      ...(d.value !== undefined && { value: Number(d.value) }),
      ...(d.suffix !== undefined && { suffix: d.suffix || null }),
      ...(d.icon !== undefined && { icon: d.icon || null }),
      ...(d.description !== undefined && { description: d.description || null }),
      ...(d.order !== undefined && { order: Number(d.order) }),
      ...(d.page !== undefined && { page: d.page }),
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("pages.edit");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.impactStat.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
