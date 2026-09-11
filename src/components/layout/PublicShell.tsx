"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImpactMarquee from "@/components/ui/ImpactMarquee";
import BackToTop from "@/components/ui/BackToTop";

export default function PublicShell() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname === "/login";

  if (isAdmin) return null;

  return (
    <>
      <Navbar />
      <ImpactMarquee />
      <Footer />
      <BackToTop />
    </>
  );
}
