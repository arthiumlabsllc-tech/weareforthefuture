import { createCaseDraft, getAdminCasePage } from "@/lib/support-a-future/case-workflow";
import { readSupportJson, supportError, supportJson } from "@/lib/support-a-future/http";
import { requireSameOrigin } from "@/lib/support-a-future/security";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { return supportJson(await getAdminCasePage(Object.fromEntries(new URL(request.url).searchParams))); }
  catch (error) { return supportError(error); }
}
export async function POST(request: Request) {
  try {
    requireSameOrigin(request.headers);
    return supportJson({ record: await createCaseDraft(await readSupportJson(request)) }, 201);
  } catch (error) { return supportError(error); }
}
