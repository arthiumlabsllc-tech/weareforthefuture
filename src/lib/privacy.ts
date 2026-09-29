// Shared by navigation, analytics, and the server boundary. Never log matched URLs.
export function isRefundPath(pathname: string) {
  return pathname === "/give/support-a-future/refund" || pathname.startsWith("/give/support-a-future/refund/");
}

export function isSensitivePath(pathname: string) {
  return pathname === "/give/support-a-future" || pathname.startsWith("/give/support-a-future/")
    || pathname === "/donate/success" || pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isSensitiveUrl(value: string) {
  try { return isSensitivePath(new URL(value, "https://privacy.invalid").pathname); }
  catch { return true; }
}

export const sensitiveHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
};
