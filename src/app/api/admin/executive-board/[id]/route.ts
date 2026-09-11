import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).optional(), role: z.string().min(1).optional(),
  bio: z.string().optional(), image: z.string().nullable().optional(),
  country: z.string().optional(), email: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(), twitter: z.string().nullable().optional(),
  termStart: z.string().nullable().optional(), termEnd: z.string().nullable().optional(),
  committee: z.string().optional(), order: z.number().optional(), published: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("boards.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("Invalid data", 400);
  const d = parsed.data;
  const data: Record<string, unknown> = { ...d, updatedBy: auth.session.userId };
  if (d.termStart !== undefined) data.termStart = d.termStart ? new Date(d.termStart) : null;
  if (d.termEnd !== undefined) data.termEnd = d.termEnd ? new Date(d.termEnd) : null;
  const member = await prisma.executiveBoardMember.update({ where: { id }, data });
  return NextResponse.json({ member });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("boards.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.executiveBoardMember.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: auth.session.userId } });
  return NextResponse.json({ success: true });
}
