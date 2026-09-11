import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";

const schema = z.object({
  question: z.string().min(1), answer: z.string().min(1), category: z.string().default("General"),
  order: z.number().optional(), published: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdmin("faq.manage");
  if ("error" in auth) return auth.error;
  const faqs = await prisma.faq.findMany({ where: { deletedAt: null }, orderBy: [{ order: "asc" }, { question: "asc" }] });
  return NextResponse.json({ faqs });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("faq.manage");
  if ("error" in auth) return auth.error;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("Invalid data", 400);
  const faq = await prisma.faq.create({ data: { ...parsed.data, createdBy: auth.session.userId, updatedBy: auth.session.userId } });
  return NextResponse.json({ faq }, { status: 201 });
}
