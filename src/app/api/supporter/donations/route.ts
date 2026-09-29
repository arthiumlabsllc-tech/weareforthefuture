import { getSupporterSessionFromCookie } from "@/lib/supporter-auth";
import { prisma } from "@/lib/db";
import { supporterDonationHistory } from "@/lib/support-a-future/payments";
import { requiredSecret } from "@/lib/support-a-future/security";
import { supportJson } from "@/lib/support-a-future/http";

export async function GET() {
  try {
    requiredSecret("SUPPORTER_JWT_SECRET");
    const session = await getSupporterSessionFromCookie();
    if (!session || typeof session.supporterId !== "string" || !session.supporterId) return supportJson({ error: "Not authenticated" }, 401);
    const supporter = await prisma.supporter.findFirst({ where: { id: session.supporterId, deletedAt: null }, select: { id: true } });
    if (!supporter) return supportJson({ error: "Not authenticated" }, 401);
    return supportJson(await supporterDonationHistory(supporter.id));
  } catch {
    return supportJson({ error: "Donation history is unavailable. Please try again." }, 503);
  }
}
