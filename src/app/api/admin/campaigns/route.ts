import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdmin("campaigns.manage");
  if ("error" in auth) return auth.error;
  const items = await prisma.campaign.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { milestones: { orderBy: { order: "asc" } }, updates: { orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin("campaigns.manage");
  if ("error" in auth) return auth.error;
  const d = await req.json();
  const item = await prisma.campaign.create({
    data: {
      title: d.title, slug: d.slug, description: d.description || null,
      heroImage: d.heroImage || null, goalAmount: Number(d.goalAmount) || 0,
      raisedAmount: Number(d.raisedAmount) || 0, published: d.published ?? true,
      createdBy: auth.session.userId, updatedBy: auth.session.userId,
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}
