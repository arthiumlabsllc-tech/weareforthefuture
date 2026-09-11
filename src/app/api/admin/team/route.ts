import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";

const teamSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
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

export async function GET() {
  const auth = await requireAdmin("team.manage");
  if ("error" in auth) return auth.error;

  const members = await prisma.teamMember.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ members });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("team.manage");
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) return apiError("Invalid data", 400);

  const member = await prisma.teamMember.create({
    data: { ...parsed.data, createdBy: auth.session.userId, updatedBy: auth.session.userId },
  });

  await prisma.auditLog.create({
    data: { userId: auth.session.userId, action: "CREATE", entity: "TeamMember", entityId: member.id, after: { name: member.name, role: member.role } },
  });

  return NextResponse.json({ member }, { status: 201 });
}
