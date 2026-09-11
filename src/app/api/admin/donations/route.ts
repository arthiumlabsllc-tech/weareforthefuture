import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdmin("donations.view");
  if ("error" in auth) return auth.error;
  const items = await prisma.donationCampaign.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { presets: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin("campaigns.manage");
  if ("error" in auth) return auth.error;
  const d = await req.json();
  const item = await prisma.donationCampaign.create({
    data: {
      name: d.name, slug: d.slug, description: d.description || null,
      heroImage: d.heroImage || null, goalAmount: Number(d.goalAmount) || 0,
      raisedAmount: Number(d.raisedAmount) || 0,
      startDate: d.startDate ? new Date(d.startDate) : null,
      endDate: d.endDate ? new Date(d.endDate) : null,
      published: d.published ?? true,
      createdBy: auth.session.userId, updatedBy: auth.session.userId,
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}
