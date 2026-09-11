import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("partners.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await request.json();
  const partner = await prisma.partner.update({ where: { id }, data: { ...body, updatedBy: auth.session.userId } });
  return NextResponse.json({ partner });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("partners.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.partner.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: auth.session.userId } });
  return NextResponse.json({ success: true });
}
