"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import SupporterNav from "./SupporterNav";

/** Routes that render without the supporter navigation (full-screen auth pages). */
const BARE_ROUTES = ["/supporter-login", "/register"];

export default function SupporterChrome({
  children,
  supporterName,
}: {
  children: ReactNode;
  supporterName?: string;
}) {
  const pathname = usePathname();
  const bare = BARE_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen bg-bg-primary">
      {!bare && <SupporterNav supporterName={supporterName} />}
      {children}
    </div>
  );
}
