"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/ui/BackToTop";

export default function BottomShell() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname === "/login";
  const isSupporter =
    pathname === "/supporter-login" ||
    pathname === "/register" ||
    pathname.startsWith("/my-account");

  if (isAdmin || isSupporter) return null;

  return (
    <>
      <Footer />
      <BackToTop />
    </>
  );
}
