import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, apiError } from "@/lib/admin-api";
import { z } from "zod";
import { programMetricsSchema } from "@/lib/programme-content";
import { resolvePillarLinks } from "@/lib/program-pillars";

const schema = z.object({
  name: z.string().min(1).optional(), slug: z.string().min(1).optional(),
  icon: z.string().nullable().optional(), image: z.string().nullable().optional(),
  shortDescription: z.string().optional(), description: z.string().optional(),
  impactMetrics: programMetricsSchema.optional(), order: z.number().optional(), published: z.boolean().optional(),
  pillarSlugs: z.array(z.string()).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("programs.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "), 400);
  const { pillarSlugs, ...programData } = parsed.data;
  const links = await resolvePillarLinks(pillarSlugs);
  const program = await prisma.$transaction(async (tx) => {
    const updated = await tx.program.update({ where: { id }, data: { ...programData, updatedBy: auth.session.userId } });
    // links === undefined => pillarSlugs omitted, leave existing links untouched.
    if (links !== undefined) {
      await tx.programPillar.deleteMany({ where: { programId: id } });
      if (links.length > 0) {
        await tx.programPillar.createMany({ data: links.map((link) => ({ programId: id, ...link })) });
      }
    }
    return updated;
  });
  return NextResponse.json({ program });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("programs.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.program.update({ where: { id }, data: { deletedAt: new Date(), updatedBy: auth.session.userId } });
  return NextResponse.json({ success: true });
}
