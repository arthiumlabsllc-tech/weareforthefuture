import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import AdvisoryBoardClient from "./AdvisoryBoardClient";

export const metadata: Metadata = {
  title: "Advisory Board",
  description:
    "Meet the advisory board members of For The Future Organization guiding our mission across Ghana and the United States.",
};

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function AdvisoryBoardPage() {
  // Guarded: fall back to an empty list if the DB is unreachable (Phase 3a.5).
  const members = await prisma.advisoryBoardMember.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { order: "asc" },
  }).catch((err) => {
    console.error("[/advisory-board] DB query failed:", err);
    return [];
  });

  const dbMembers = members.map((m) => ({
    name: m.name,
    role: m.role,
    image: m.image || "",
    country: m.country || "",
  }));

  return <AdvisoryBoardClient initialMembers={dbMembers} />;
}
