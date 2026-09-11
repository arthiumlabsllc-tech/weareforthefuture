import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("shipping.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const d = await req.json();
  const zone = await prisma.shippingZone.update({
    where: { id },
    data: {
      ...(d.region !== undefined && { region: d.region }),
      ...(d.fee !== undefined && { fee: Number(d.fee) }),
      ...(d.freeThreshold !== undefined && { freeThreshold: d.freeThreshold ? Number(d.freeThreshold) : null }),
      ...(d.heavySurcharge !== undefined && { heavySurcharge: d.heavySurcharge ? Number(d.heavySurcharge) : null }),
      ...(d.pickupEnabled !== undefined && { pickupEnabled: d.pickupEnabled }),
      ...(d.pickupAddress !== undefined && { pickupAddress: d.pickupAddress || null }),
    },
  });
  return NextResponse.json({ zone });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("shipping.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.shippingZone.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
