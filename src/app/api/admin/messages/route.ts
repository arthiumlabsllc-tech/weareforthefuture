import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdmin("messages.manage");
  if ("error" in auth) return auth.error;
  const messages = await prisma.contactSubmission.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin("messages.manage");
  if ("error" in auth) return auth.error;
  const d = await req.json();
  const msg = await prisma.contactSubmission.create({
    data: { name: d.name, email: d.email, phone: d.phone || null, subject: d.subject || null, message: d.message },
  });
  return NextResponse.json({ msg }, { status: 201 });
}
