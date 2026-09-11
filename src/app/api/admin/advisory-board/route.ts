import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1), role: z.string().min(1), bio: z.string().optional(),
  image: z.string().nullable().optional(), country: z.string().optional(),
  email: z.string().nullable().optional(), linkedin: z.string().nullable().optional(),
  twitter: z.string().nullable().optional(), termStart: z.string().nullable().optional(),
  termEnd: z.string().nullable().optional(), committee: z.string().optional(),
  order: z.number().optional(), published: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdmin("boards.manage");
  if ("error" in auth) return auth.error;
  const members = await prisma.advisoryBoardMember.findMany({ where: { deletedAt: null }, orderBy: [{ order: "asc" }, { name: "asc" }] });
  return NextResponse.json({ members });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("boards.manage");
  if ("error" in auth) return auth.error;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("Invalid data", 400);
  const d = parsed.data;
  const member = await prisma.advisoryBoardMember.create({
    data: { ...d, termStart: d.termStart ? new Date(d.termStart) : null, termEnd: d.termEnd ? new Date(d.termEnd) : null, createdBy: auth.session.userId, updatedBy: auth.session.userId },
  });
  await prisma.auditLog.create({ data: { userId: auth.session.userId, action: "CREATE", entity: "AdvisoryBoardMember", entityId: member.id, after: { name: member.name } } });
  return NextResponse.json({ member }, { status: 201 });
}
