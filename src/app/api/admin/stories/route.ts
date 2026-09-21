import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1), slug: z.string().min(1), excerpt: z.string().optional(),
  content: z.string().default(""), featuredImage: z.string().nullable().optional(),
  gallery: z.array(z.union([z.string(), z.object({ url: z.string(), alt: z.string(), caption: z.string().optional() })])).optional(), childName: z.string().nullable().optional(),
  age: z.number().nullable().optional(), location: z.string().nullable().optional(),
  program: z.string().nullable().optional(), pullQuote: z.string().nullable().optional(),
  published: z.boolean().optional(), metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  consentGiven: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireAdmin("stories.manage");
  if ("error" in auth) return auth.error;
  const stories = await prisma.impactStory.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ stories });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("stories.manage");
  if ("error" in auth) return auth.error;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("Invalid data", 400);
  const d = parsed.data;
  const story = await prisma.impactStory.create({
    data: {
      title: d.title, slug: d.slug, content: d.content || "",
      excerpt: d.excerpt ?? null, featuredImage: d.featuredImage ?? null,
      gallery: d.gallery ?? [], childName: d.childName ?? null,
      age: d.age ?? null, location: d.location ?? null,
      program: d.program ?? null, pullQuote: d.pullQuote ?? null,
      published: d.published ?? false,
      consentGiven: d.consentGiven ?? false,
      metaTitle: d.metaTitle ?? null, metaDescription: d.metaDescription ?? null,
      createdBy: auth.session.userId, updatedBy: auth.session.userId,
    },
  });
  await prisma.auditLog.create({ data: { userId: auth.session.userId, action: "CREATE", entity: "ImpactStory", entityId: story.id, after: { title: story.title } } });
  return NextResponse.json({ story }, { status: 201 });
}
