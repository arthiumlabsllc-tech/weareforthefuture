import { getAdminCase, saveCaseDraft, transitionCase } from "@/lib/support-a-future/case-workflow";
import { readSupportJson, supportError, supportJson } from "@/lib/support-a-future/http";
import { requireSameOrigin } from "@/lib/support-a-future/security";

type Context = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: Context) {
  try { return supportJson(await getAdminCase((await params).id)); }
  catch (error) { return supportError(error); }
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    requireSameOrigin(request.headers);
    return supportJson({ record: await saveCaseDraft((await params).id, await readSupportJson(request)) });
  } catch (error) { return supportError(error); }
}
export async function POST(request: Request, { params }: Context) {
  try {
    requireSameOrigin(request.headers);
    return supportJson({ record: await transitionCase((await params).id, await readSupportJson(request)) });
  } catch (error) { return supportError(error); }
}
