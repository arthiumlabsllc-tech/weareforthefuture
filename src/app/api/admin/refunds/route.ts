import { getRefundQueue } from "@/lib/support-a-future/refund-admin";
import { supportError, supportJson } from "@/lib/support-a-future/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    return supportJson(await getRefundQueue(query));
  } catch (error) { return supportError(error); }
}
