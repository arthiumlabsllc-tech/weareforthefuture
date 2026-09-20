import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { PRIVACY_CONTENT, PRIVACY_SUMMARY } from "@/data/legal";
import { DEFAULT_OG_IMAGE } from "@/data/site";
import LegalPageShell from "@/components/legal/LegalPageShell";

export const revalidate = 3600; // 1 hour — legal pages rarely change

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How For The Future Organization collects, uses, and protects your personal data. Your rights under GDPR, CCPA, and Ghana's Data Protection Act.",
  openGraph: {
    title: "Privacy Policy | For The Future Organization",
    description:
      "How we collect, use, and protect your personal data.",
    url: "https://weareforthefuture.org/privacy",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: "https://weareforthefuture.org/privacy",
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

export default async function PrivacyPage() {
  const page = await loadLegalPage("privacy");

  return (
    <LegalPageShell
      title={page?.title ?? "Privacy Policy"}
      lastUpdated={page?.lastUpdated ?? new Date("2026-09-01")}
      summary={PRIVACY_SUMMARY}
      content={page?.content ?? PRIVACY_CONTENT}
    />
  );
}
