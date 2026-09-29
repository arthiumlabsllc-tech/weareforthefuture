import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Support a Future",
  description: "Verified needs, administered by FTF with consent and safeguarding review.",
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
  alternates: { canonical: null },
  openGraph: { title: "Support a Future", description: "FTF-administered support for verified needs.", images: [], url: null },
  twitter: { card: "summary", title: "Support a Future", description: "FTF-administered support for verified needs.", images: [] },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
