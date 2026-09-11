import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).optional(), slug: z.string().min(1).optional(),
  icon: z.string().nullable().optional(), image: z.string().nullable().optional(),
  shortDescription: z.string().optional(), description: z.string().optional(),
  impactMetrics: z.any().optional(), order: z.number().optional(), published: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("programs.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("Invalid data", 400);
  const program = await prisma.program.update({ where: { id }, data: { ...parsed.data, updatedBy: auth.session.userId } });
  return NextResponse.json({ program });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("programs.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.program.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: auth.session.userId } });
  return NextResponse.json({ success: true });
}
