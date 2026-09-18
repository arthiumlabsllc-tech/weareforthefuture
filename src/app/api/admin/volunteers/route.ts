import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdmin("messages.manage");
  if ("error" in auth) return auth.error;
  const applications = await prisma.volunteerApplication.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ applications });
}
