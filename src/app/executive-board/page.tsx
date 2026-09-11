import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import ExecutiveBoardClient from "./ExecutiveBoardClient";

export const metadata: Metadata = {
  title: "Executive Board",
  description:
    "Meet the executive board members of For The Future Organization leading our mission across Ghana and Nigeria.",
};

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function ExecutiveBoardPage() {
  const members = await prisma.executiveBoardMember.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { order: "asc" },
  });

  const dbMembers = members.map((m) => ({
    name: m.name,
    role: m.role,
    image: m.image || "",
    country: m.country || "",
  }));

  return <ExecutiveBoardClient initialMembers={dbMembers} />;
}
