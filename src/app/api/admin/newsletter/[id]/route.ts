import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("newsletter.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const d = await req.json();
  const sub = await prisma.newsletterSubscriber.update({
    where: { id },
    data: { ...(d.active !== undefined && { active: d.active }) },
  });
  return NextResponse.json({ sub });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("newsletter.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.newsletterSubscriber.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
