import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdmin("shipping.manage");
  if ("error" in auth) return auth.error;
  const zones = await prisma.shippingZone.findMany({
    where: { deletedAt: null },
    orderBy: { region: "asc" },
    include: { cities: { orderBy: { city: "asc" } } },
  });
  return NextResponse.json({ zones });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin("shipping.manage");
  if ("error" in auth) return auth.error;
  const d = await req.json();
  const zone = await prisma.shippingZone.create({
    data: {
      region: d.region, fee: Number(d.fee) || 0,
      freeThreshold: d.freeThreshold ? Number(d.freeThreshold) : null,
      heavySurcharge: d.heavySurcharge ? Number(d.heavySurcharge) : null,
      pickupEnabled: d.pickupEnabled ?? false,
      pickupAddress: d.pickupAddress || null,
    },
  });
  return NextResponse.json({ zone }, { status: 201 });
}
