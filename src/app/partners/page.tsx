import type { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import PartnersClient from "./PartnersClient";

export const metadata: Metadata = {
  title: "Our Partners",
  description:
    "Meet the organizations and businesses partnering with For The Future to transform the lives of underprivileged children.",
};

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { order: "asc" },
  });

  const dbPartners = partners.map((p) => ({
    name: p.name,
    logo: p.logo || "",
    type: p.type,
    tier: p.tier,
  }));

  return <PartnersClient initialPartners={dbPartners} />;
}
