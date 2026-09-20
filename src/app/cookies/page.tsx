import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { COOKIES_CONTENT, COOKIES_SUMMARY } from "@/data/legal";
import { DEFAULT_OG_IMAGE } from "@/data/site";
import LegalPageShell from "@/components/legal/LegalPageShell";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "What cookies For The Future Organization uses, why they are essential, and how to manage your cookie preferences.",
  openGraph: {
    title: "Cookie Policy | For The Future Organization",
    description:
      "What cookies we use and how to manage your preferences.",
    url: "https://weareforthefuture.org/cookies",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: "https://weareforthefuture.org/cookies",
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

export default async function CookiesPage() {
  const page = await loadLegalPage("cookies");

  return (
    <LegalPageShell
      title={page?.title ?? "Cookie Policy"}
      lastUpdated={page?.lastUpdated ?? new Date("2026-09-01")}
      summary={COOKIES_SUMMARY}
      content={page?.content ?? COOKIES_CONTENT}
    />
  );
}
