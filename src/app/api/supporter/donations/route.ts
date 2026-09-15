import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSupporterSessionFromCookie } from "@/lib/supporter-auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getSupporterSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const donations = await prisma.donation.findMany({
    where: { supporterId: session.supporterId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      currency: true,
      paymentStatus: true,
      anonymous: true,
      createdAt: true,
      campaign: {
        select: { name: true, slug: true },
      },
    },
  });

  return NextResponse.json({ donations });
}
