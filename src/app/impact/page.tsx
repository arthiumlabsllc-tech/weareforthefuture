import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import ImpactClient from "./ImpactClient";

export const metadata: Metadata = {
  title: "Our Impact",
  description:
    "See the measurable impact of For The Future Organization - from lives changed to communities transformed across Ghana, Nigeria, and the US.",
};

// Refresh document list periodically so newly published reports appear.
export const revalidate = 300;

export default async function ImpactPage() {
  const documents = await prisma.document.findMany({
    where: { published: true, deletedAt: null },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  });

  const reports = documents
    .filter((d) => Boolean(d.fileUrl))
    .map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      fileUrl: d.fileUrl,
      year: d.year,
      category: d.category,
    }));

  return <ImpactClient reports={reports} />;
}
