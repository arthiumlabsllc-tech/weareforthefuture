import { NextResponse } from "next/server";
import { getSessionFromCookie, clearSessionCookie } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const session = await getSessionFromCookie();

    if (session) {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "LOGOUT",
          entity: "User",
          entityId: session.userId,
        },
      });
    }

    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Logout] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
