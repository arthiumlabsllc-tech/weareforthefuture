import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SupportError } from "./domain";
import { sensitiveHeaders } from "../privacy";

export const privateHeaders = sensitiveHeaders;
export function supportJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: privateHeaders });
}
export function supportError(error: unknown) {
  if (error instanceof SupportError) return supportJson({ error: error.message, code: error.code }, error.status);
  if (error instanceof z.ZodError) return supportJson({ error: "Check the submitted fields.",
    fields: error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })) }, 400);
  return supportJson({ error: "This service is temporarily unavailable. Please try again.", code: "unavailable" }, 503);
}
export async function readSupportJson(request: Request) {
  if (Number(request.headers.get("content-length")) > 24_000) throw new SupportError("too_large", "This request is too large.", 413);
  const text = await request.text();
  if (text.length > 24_000) throw new SupportError("too_large", "This request is too large.", 413);
  try { return JSON.parse(text) as unknown; } catch { throw new SupportError("invalid_request", "This request could not be read."); }
}
