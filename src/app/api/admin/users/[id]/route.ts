import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";
import { hashPassword } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("users.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const d = await req.json();
  const data: Record<string, unknown> = {};
  if (d.name !== undefined) data.name = d.name || null;
  if (d.role !== undefined) data.role = d.role;
  if (d.suspended !== undefined) data.suspended = d.suspended;
  if (d.avatar !== undefined) data.avatar = d.avatar || null;
  if (d.password) data.passwordHash = await hashPassword(d.password);
  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, suspended: true },
  });
  return NextResponse.json({ user });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("users.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
