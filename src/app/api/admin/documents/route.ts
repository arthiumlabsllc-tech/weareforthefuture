import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1), description: z.string().optional(), fileUrl: z.string().min(1),
  category: z.string().default("Annual Report"), year: z.number().nullable().optional(),
  published: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdmin("documents.manage");
  if ("error" in auth) return auth.error;
  const documents = await prisma.document.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ documents });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("documents.manage");
  if ("error" in auth) return auth.error;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("Invalid data", 400);
  const doc = await prisma.document.create({ data: { ...parsed.data, createdBy: auth.session.userId, updatedBy: auth.session.userId } });
  return NextResponse.json({ doc }, { status: 201 });
}
