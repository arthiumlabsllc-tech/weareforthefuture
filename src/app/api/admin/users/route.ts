import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";
import { hashPassword } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin("users.manage");
  if ("error" in auth) return auth.error;
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, avatar: true, suspended: true, emailVerified: true, lastLoginAt: true, createdAt: true },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin("users.manage");
  if ("error" in auth) return auth.error;
  const d = await req.json();
  const passwordHash = await hashPassword(d.password || "changeme123");
  const user = await prisma.user.create({
    data: {
      email: d.email, name: d.name || null, passwordHash,
      role: d.role || "VIEWER", avatar: d.avatar || null,
    },
    select: { id: true, email: true, name: true, role: true, suspended: true, createdAt: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}
