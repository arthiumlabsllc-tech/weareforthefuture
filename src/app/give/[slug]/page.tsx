import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GiveSlugClient from "./GiveSlugClient";
import { resolveGivingTarget, getGivingSlugs } from "@/lib/give";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;
export const dynamicParams = true;

/** Prerender the reserved general routes plus every published programme/campaign slug. */
export async function generateStaticParams() {
  const slugs = await getGivingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const target = await resolveGivingTarget(decodeURIComponent(slug));
  const name = target?.name ?? "Give";
  return {
    title: name,
    description:
      target?.description?.slice(0, 155) ??
      `Support ${name} with For The Future Organization. Secure, tax-deductible giving across Ghana and Nigeria.`,
  };
}

export default async function GiveSlugPage({ params }: Props) {
  const { slug } = await params;
  const target = await resolveGivingTarget(decodeURIComponent(slug));
  if (!target) notFound();
  return <GiveSlugClient target={target} />;
}
