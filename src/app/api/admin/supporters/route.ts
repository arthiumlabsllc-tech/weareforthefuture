import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSessionFromCookie } from "@/lib/admin-auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const supporters = await prisma.supporter.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      city: true,
      createdAt: true,
      lastLoginAt: true,
      _count: {
        select: {
          donations: true,
          orders: true,
        },
      },
      donations: {
        select: { amount: true, paymentStatus: true },
        where: { paymentStatus: "paid" },
      },
    },
  });

  // Calculate total donated
  const result = supporters.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    country: s.country,
    city: s.city,
    joinDate: s.createdAt,
    lastLoginAt: s.lastLoginAt,
    donationCount: s._count.donations,
    orderCount: s._count.orders,
    totalDonated: s.donations.reduce((sum, d) => sum + d.amount, 0),
  }));

  return NextResponse.json({ supporters: result });
}
