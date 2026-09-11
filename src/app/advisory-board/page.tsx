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
  const members = await prisma.advisoryBoardMember.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { order: "asc" },
  });

  const dbMembers = members.map((m) => ({
    name: m.name,
    role: m.role,
    image: m.image || "",
    country: m.country || "",
  }));

  return <AdvisoryBoardClient initialMembers={dbMembers} />;
}
