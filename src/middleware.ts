import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /my-account routes (supporter area)
  if (pathname.startsWith("/my-account")) {
    const sessionCookie = request.cookies.get("ftf-supporter-session");
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/supporter-login", request.url));
    }
    return NextResponse.next();
  }

  // Only intercept /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow admin API routes (they handle auth themselves)
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("ftf-admin-session");
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Let the page render - server components will verify the token
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/my-account/:path*"],
};
