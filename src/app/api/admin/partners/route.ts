import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1), logo: z.string().nullable().optional(), website: z.string().nullable().optional(),
  description: z.string().optional(), type: z.string().default("Corporate"), tier: z.string().default("Bronze"),
  sinceYear: z.number().nullable().optional(), order: z.number().optional(), published: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdmin("partners.manage");
  if ("error" in auth) return auth.error;
  const partners = await prisma.partner.findMany({ where: { deletedAt: null }, orderBy: [{ order: "asc" }, { name: "asc" }] });
  return NextResponse.json({ partners });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("partners.manage");
  if ("error" in auth) return auth.error;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("Invalid data", 400);
  const partner = await prisma.partner.create({ data: { ...parsed.data, createdBy: auth.session.userId, updatedBy: auth.session.userId } });
  await prisma.auditLog.create({ data: { userId: auth.session.userId, action: "CREATE", entity: "Partner", entityId: partner.id, after: { name: partner.name } } });
  return NextResponse.json({ partner }, { status: 201 });
}
