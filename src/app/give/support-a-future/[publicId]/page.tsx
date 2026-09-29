import type { Metadata } from "next";
import { getPublicCase } from "@/lib/support-a-future/cases";
import { casePaymentsEnabled } from "@/lib/support-a-future/security";
import CaseDetail from "./CaseDetail";

export const metadata: Metadata = { title: "Verified need | Support a Future", alternates: { canonical: null } };

export default async function PublicCasePage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  let initial = null;
  let failed = false;
  try {
    const result = await getPublicCase(publicId);
    if (result) initial = { case: result.projection, fundable: result.fundable, checkoutEnabled: casePaymentsEnabled() };
  } catch { failed = true; }
  return <CaseDetail publicId={publicId} initial={initial} failed={failed} />;
}
