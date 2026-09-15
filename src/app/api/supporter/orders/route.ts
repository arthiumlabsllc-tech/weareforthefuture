import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSupporterSessionFromCookie } from "@/lib/supporter-auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getSupporterSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { supporterId: session.supporterId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderId: true,
      total: true,
      currency: true,
      paymentStatus: true,
      fulfillmentStatus: true,
      createdAt: true,
      items: true,
    },
  });

  return NextResponse.json({ orders });
}
