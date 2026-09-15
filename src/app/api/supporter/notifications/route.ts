import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSupporterSessionFromCookie } from "@/lib/supporter-auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const session = await getSupporterSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.supporterNotification.findMany({
      where: { supporterId: session.supporterId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.supporterNotification.count({
      where: { supporterId: session.supporterId },
    }),
  ]);

  const unreadCount = await prisma.supporterNotification.count({
    where: { supporterId: session.supporterId, read: false },
  });

  return NextResponse.json({ notifications, total, unreadCount });
}

export async function PUT(request: NextRequest) {
  const session = await getSupporterSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { id, markAllRead } = body;

  if (markAllRead) {
    await prisma.supporterNotification.updateMany({
      where: { supporterId: session.supporterId, read: false },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (id) {
    await prisma.supporterNotification.updateMany({
      where: { id, supporterId: session.supporterId },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Missing id or markAllRead" }, { status: 400 });
}
