import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie, type AdminSession } from "./admin-auth";
import { hasPermission } from "./admin-rbac";

type Permission = Parameters<typeof hasPermission>[1];

/**
 * Validates admin session and permission. Returns session or error response.
 */
export async function requireAdmin(
  permission: Permission
): Promise<{ session: AdminSession } | { error: NextResponse }> {
  const session = await getSessionFromCookie();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!hasPermission(session, permission)) {
    return { error: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }) };
  }
  return { session };
}

/**
 * Standard JSON error response
 */
export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard JSON success response
 */
export function apiSuccess(data: Record<string, unknown>, status: number = 200) {
  return NextResponse.json(data, { status });
}
