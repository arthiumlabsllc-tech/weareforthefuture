import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROUTES = ["/admin"];
const PUBLIC_ADMIN_ROUTES = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /admin routes
  if (!ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow public admin routes (login)
  if (PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow admin API routes (they handle auth themselves)
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("ftf-admin-session");
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Let the page render - server components will verify the token
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
