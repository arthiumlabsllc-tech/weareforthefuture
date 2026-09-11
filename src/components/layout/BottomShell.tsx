"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/ui/BackToTop";

export default function BottomShell() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname === "/login";

  if (isAdmin) return null;

  return (
    <>
      <Footer />
      <BackToTop />
    </>
  );
}
