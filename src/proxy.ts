import { NextRequest, NextResponse } from "next/server";
import { getActiveAdminSession } from "@/lib/admin-auth";
import { adminHome, adminRoutePermission, hasPermission } from "@/lib/admin-rbac";
import { isRefundPath, sensitiveHeaders } from "@/lib/privacy";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/my-account" || pathname.startsWith("/my-account/")) {
    return request.cookies.get("ftf-supporter-session") ? NextResponse.next()
      : NextResponse.redirect(new URL("/supporter-login", request.url));
  }
  let response: NextResponse;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    try {
      const token = request.cookies.get("ftf-admin-session")?.value;
      const session = token ? await getActiveAdminSession(token) : null;
      if (!session) response = NextResponse.redirect(new URL("/login", request.url));
      else if (pathname === "/admin") response = NextResponse.redirect(new URL(adminHome(session.role), request.url));
      else {
        const permission = adminRoutePermission(pathname);
        response = permission && hasPermission(session, permission) ? NextResponse.next()
          : new NextResponse("You do not have permission to view this page.", { status: 403 });
      }
    } catch {
      response = new NextResponse("Admin access is temporarily unavailable. Please try again.", { status: 503 });
    }
  } else if (request.method === "GET" && request.headers.get("rsc") === "1") {
    // A non-Flight response makes the App Router perform a full document navigation.
    // Loaded public analytics must never observe a bearer URL via history.pushState.
    response = new NextResponse(null, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } else response = NextResponse.next();

  for (const [name, value] of Object.entries(sensitiveHeaders)) response.headers.set(name, value);
  if (isRefundPath(pathname)) {
    response.headers.set("Content-Security-Policy", [
      "default-src 'self'", `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'", "img-src 'self' data:", "connect-src 'self'",
      "font-src 'self'", "object-src 'none'", "base-uri 'none'", "frame-ancestors 'none'", "form-action 'self'",
    ].join("; "));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/my-account/:path*", "/give/support-a-future/:path*", "/donate/success"],
};
