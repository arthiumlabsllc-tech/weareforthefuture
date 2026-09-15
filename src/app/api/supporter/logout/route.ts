import { NextResponse } from "next/server";
import { clearSupporterSessionCookie } from "@/lib/supporter-auth";

export async function POST() {
  await clearSupporterSessionCookie();
  return NextResponse.json({ ok: true });
}
