import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";
import { programMetricsSchema } from "@/lib/programme-content";
import { resolvePillarLinks } from "@/lib/program-pillars";

const schema = z.object({
  name: z.string().min(1), slug: z.string().min(1), icon: z.string().nullable().optional(),
  image: z.string().nullable().optional(), shortDescription: z.string().optional(),
  description: z.string().default(""), impactMetrics: programMetricsSchema.optional(),
  order: z.number().optional(), published: z.boolean().optional(),
  pillarSlugs: z.array(z.string()).optional(),
});

export async function GET() {
  const auth = await requireAdmin("programs.manage");
  if ("error" in auth) return auth.error;
  const programs = await prisma.program.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { pillars: { include: { pillar: { select: { slug: true } } }, orderBy: { order: "asc" } } },
  });
  const withSlugs = programs.map(({ pillars, ...program }) => ({
    ...program,
    pillarSlugs: pillars.map((link) => link.pillar.slug),
  }));
  return NextResponse.json({ programs: withSlugs });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin("programs.manage");
  if ("error" in auth) return auth.error;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "), 400);
  const { pillarSlugs, ...programData } = parsed.data;
  const links = await resolvePillarLinks(pillarSlugs);
  const program = await prisma.program.create({
    data: {
      ...programData,
      createdBy: auth.session.userId,
      updatedBy: auth.session.userId,
      ...(links && links.length > 0 ? { pillars: { create: links } } : {}),
    },
  });
  await prisma.auditLog.create({ data: { userId: auth.session.userId, action: "CREATE", entity: "Program", entityId: program.id, after: { name: program.name } } });
  return NextResponse.json({ program }, { status: 201 });
}
