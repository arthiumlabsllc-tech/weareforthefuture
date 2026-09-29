"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import GA4Script from "./GA4Script";
import { isSensitivePath, isSensitiveUrl } from "@/lib/privacy";

export default function AnalyticsBoundary({ enableGa4 }: { enableGa4: boolean }) {
  const pathname = usePathname();
  // A private document stays untracked even if another component invokes router.push.
  const [privateDocument] = useState(() => isSensitivePath(pathname));
  const blocked = privateDocument || isSensitivePath(pathname);

  useEffect(() => {
    if (!blocked) return;
    const leavePrivately = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      anchor.referrerPolicy = "no-referrer";
      anchor.rel = "noreferrer noopener";
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const target = new URL(anchor.href);
      if (target.origin !== location.origin || (target.pathname === location.pathname && target.search === location.search)) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(target.href);
    };
    document.addEventListener("click", leavePrivately, true);
    return () => document.removeEventListener("click", leavePrivately, true);
  }, [blocked]);

  if (blocked) return null;
  return <>
    <Analytics debug={false} beforeSend={(event) =>
      isSensitiveUrl(event.url) || isSensitivePath(window.location.pathname) || (document.referrer && isSensitiveUrl(document.referrer)) ? null : event} />
    {enableGa4 && <GA4Script />}
  </>;
}
