import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import TeamClient from "./TeamClient";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the passionate individuals leading For The Future Organization across Ghana, Nigeria, and the United States.",
};

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  // Guarded: fall back to an empty list if the DB is unreachable (Phase 3a.5).
  const members = await prisma.teamMember.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { order: "asc" },
  }).catch((err) => {
    console.error("[/team] DB query failed:", err);
    return [];
  });

  const dbMembers = members.map((m) => ({
    name: m.name,
    role: m.role,
    country: m.country || "",
    category: (m.department || "leadership") as "leadership" | "ghana" | "nigeria" | "us",
    bio: m.bio || undefined,
    image: m.image || undefined,
  }));

  return <TeamClient initialMembers={dbMembers} />;
}
