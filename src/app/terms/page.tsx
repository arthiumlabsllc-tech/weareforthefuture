import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { TERMS_CONTENT, TERMS_SUMMARY } from "@/data/legal";
import { DEFAULT_OG_IMAGE } from "@/data/site";
import LegalPageShell from "@/components/legal/LegalPageShell";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing your use of the For The Future Organization website, donations, intellectual property, liability, and governing law.",
  openGraph: {
    title: "Terms of Service | For The Future Organization",
    description:
      "Terms governing your use of our website and donation services.",
    url: "https://weareforthefuture.org/terms",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: "https://weareforthefuture.org/terms",
  },
};

async function loadLegalPage(slug: string) {
  try {
    return await prisma.legalPage.findFirst({
      where: { slug, deletedAt: null },
    });
  } catch {
    return null;
  }
}

export default async function TermsPage() {
  const page = await loadLegalPage("terms");

  return (
    <LegalPageShell
      title={page?.title ?? "Terms of Service"}
      lastUpdated={page?.lastUpdated ?? new Date("2026-09-01")}
      summary={TERMS_SUMMARY}
      content={page?.content ?? TERMS_CONTENT}
    />
  );
}
