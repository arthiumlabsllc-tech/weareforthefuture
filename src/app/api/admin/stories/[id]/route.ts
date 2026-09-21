import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).optional(), slug: z.string().min(1).optional(),
  excerpt: z.string().nullable().optional(), content: z.string().optional(),
  featuredImage: z.string().nullable().optional(), gallery: z.array(z.union([z.string(), z.object({ url: z.string(), alt: z.string(), caption: z.string().optional() })])).optional(),
  childName: z.string().nullable().optional(), age: z.number().nullable().optional(),
  location: z.string().nullable().optional(), program: z.string().nullable().optional(),
  pullQuote: z.string().nullable().optional(), published: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(), metaDescription: z.string().nullable().optional(),
  consentGiven: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("stories.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("Invalid data", 400);
  const story = await prisma.impactStory.update({ where: { id }, data: { ...parsed.data, updatedBy: auth.session.userId } });
  return NextResponse.json({ story });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("stories.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.impactStory.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: auth.session.userId } });
  return NextResponse.json({ success: true });
}
