import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdmin("pages.edit");
  if ("error" in auth) return auth.error;
  const items = await prisma.testimonial.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin("pages.edit");
  if ("error" in auth) return auth.error;
  const d = await req.json();
  const item = await prisma.testimonial.create({
    data: {
      quote: d.quote, author: d.author, role: d.role || null,
      image: d.image || null, order: Number(d.order) || 0,
      published: d.published ?? true,
      createdBy: auth.session.userId, updatedBy: auth.session.userId,
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}
