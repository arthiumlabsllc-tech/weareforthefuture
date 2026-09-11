import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdmin("pages.edit");
  if ("error" in auth) return auth.error;

  const items = await prisma.impactStat.findMany({
    where: { deletedAt: null },
    orderBy: [{ page: "asc" }, { order: "asc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin("pages.edit");
  if ("error" in auth) return auth.error;

  const d = await req.json();
  const item = await prisma.impactStat.create({
    data: {
      label: d.label,
      value: Number(d.value) || 0,
      suffix: d.suffix || null,
      icon: d.icon || null,
      description: d.description || null,
      order: Number(d.order) || 0,
      page: d.page || "home",
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}
