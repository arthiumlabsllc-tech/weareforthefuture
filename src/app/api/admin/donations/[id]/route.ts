import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("campaigns.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const d = await req.json();
  const item = await prisma.donationCampaign.update({
    where: { id },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.slug !== undefined && { slug: d.slug }),
      ...(d.description !== undefined && { description: d.description || null }),
      ...(d.heroImage !== undefined && { heroImage: d.heroImage || null }),
      ...(d.goalAmount !== undefined && { goalAmount: Number(d.goalAmount) }),
      ...(d.raisedAmount !== undefined && { raisedAmount: Number(d.raisedAmount) }),
      ...(d.startDate !== undefined && { startDate: d.startDate ? new Date(d.startDate) : null }),
      ...(d.endDate !== undefined && { endDate: d.endDate ? new Date(d.endDate) : null }),
      ...(d.published !== undefined && { published: d.published }),
      updatedBy: auth.session.userId,
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("campaigns.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.donationCampaign.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
