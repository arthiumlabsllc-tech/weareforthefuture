import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdmin("newsletter.manage");
  if ("error" in auth) return auth.error;
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ subscribers });
}
