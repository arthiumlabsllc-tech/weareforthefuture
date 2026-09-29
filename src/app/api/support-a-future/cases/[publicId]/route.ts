import { getPublicCase } from "@/lib/support-a-future/cases";
import { supportError, supportJson } from "@/lib/support-a-future/http";
import { casePaymentsEnabled } from "@/lib/support-a-future/security";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const result = await getPublicCase((await params).publicId);
    if (!result) return supportJson({ error: "This case is unavailable.", code: "case_unavailable" }, 404);
    // Never serialize result.record: it contains private consent and workflow data.
    return supportJson({ case: result.projection, fundable: result.fundable, checkoutEnabled: casePaymentsEnabled() });
  } catch (error) { return supportError(error); }
}
