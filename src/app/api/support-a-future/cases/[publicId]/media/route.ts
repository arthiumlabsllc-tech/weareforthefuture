import { supportJson } from "@/lib/support-a-future/http";

export const dynamic = "force-dynamic";

// Fail closed for every asset until eligibility-checked restricted streaming is operational.
// No Cloudinary original, redirect, optimization cache, or case existence disclosure.
export async function GET() {
  return supportJson({ error: "Case media is unavailable." }, 404);
}
