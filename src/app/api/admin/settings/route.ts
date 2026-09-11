import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdmin("settings.manage");
  if ("error" in auth) return auth.error;
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin("settings.manage");
  if ("error" in auth) return auth.error;
  const d = await req.json();
  // d.settings is an array of { key, value }
  const results = [];
  for (const s of d.settings || []) {
    const setting = await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, updatedBy: auth.session.userId },
      create: { key: s.key, value: s.value, updatedBy: auth.session.userId },
    });
    results.push(setting);
  }
  return NextResponse.json({ settings: results });
}
