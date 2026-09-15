import { NextResponse } from "next/server";
import { getSupporterSessionFromCookie } from "@/lib/supporter-auth";

export async function GET() {
  const session = await getSupporterSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    supporter: { name: session.name, email: session.email },
  });
}
