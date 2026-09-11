import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("orders.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const d = await req.json();
  const data: Record<string, unknown> = {};
  if (d.fulfillmentStatus) data.fulfillmentStatus = d.fulfillmentStatus;
  if (d.paymentStatus) data.paymentStatus = d.paymentStatus;
  if (d.trackingNumber !== undefined) data.trackingNumber = d.trackingNumber;
  const order = await prisma.order.update({ where: { id }, data });
  return NextResponse.json({ order });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("orders.manage");
  if ("error" in auth) return auth.error;
  const { id } = await params;
  await prisma.order.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
