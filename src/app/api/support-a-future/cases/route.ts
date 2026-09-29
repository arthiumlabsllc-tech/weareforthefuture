import { NextRequest } from "next/server";
import { z } from "zod";
import { getCasePage } from "@/lib/support-a-future/cases";
import { supportError, supportJson } from "@/lib/support-a-future/http";
import { casePaymentsEnabled } from "@/lib/support-a-future/security";
import { SupportError } from "@/lib/support-a-future/domain";

export const dynamic = "force-dynamic";
const querySchema = z.object({ cursor: z.string().max(400).optional(), archive: z.enum(["true", "false"]).optional() }).strict();

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    if ([...params.keys()].some((key) => params.getAll(key).length !== 1)) throw new SupportError("invalid_query", "Please refresh the case list.");
    const query = querySchema.parse(Object.fromEntries(params));
    const page = await getCasePage({ cursor: query.cursor, archive: query.archive === "true" });
    return supportJson({ ...page, checkoutEnabled: casePaymentsEnabled() });
  } catch (error) { return supportError(error); }
}
