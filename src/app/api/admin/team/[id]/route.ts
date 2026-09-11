import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  bio: z.string().optional(),
  image: z.string().nullable().optional(),
  department: z.string().optional(),
  country: z.string().optional(),
  email: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("team.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return apiError("Invalid data", 400);

  const existing = await prisma.teamMember.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) return apiError("Not found", 404);

  const member = await prisma.teamMember.update({
    where: { id },
    data: { ...parsed.data, updatedBy: auth.session.userId },
  });

  await prisma.auditLog.create({
    data: { userId: auth.session.userId, action: "UPDATE", entity: "TeamMember", entityId: id, before: { name: existing.name }, after: { name: member.name } },
  });

  return NextResponse.json({ member });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("team.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;

  await prisma.teamMember.update({
    where: { id },
    data: { deletedAt: new Date(), updatedBy: auth.session.userId },
  });

  await prisma.auditLog.create({
    data: { userId: auth.session.userId, action: "DELETE", entity: "TeamMember", entityId: id },
  });

  return NextResponse.json({ success: true });
}
