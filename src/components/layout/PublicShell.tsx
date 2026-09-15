"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ImpactMarquee from "@/components/ui/ImpactMarquee";

export default function PublicShell() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname === "/login";
  const isSupporter =
    pathname === "/supporter-login" ||
    pathname === "/register" ||
    pathname.startsWith("/my-account");

  if (isAdmin || isSupporter) return null;

  return (
    <>
      <Navbar />
      <ImpactMarquee />
    </>
  );
}
