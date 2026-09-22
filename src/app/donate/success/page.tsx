"use client";

import { Suspense } from "react";
import SuccessContent from "./SuccessContent";
import SectionWrapper from "@/components/ui/SectionWrapper";

export default function DonateSuccessPage() {
  return (
    <SectionWrapper background="cream" className="min-h-screen overflow-hidden pt-40! pb-16! opacity-100! transform-none!">
      <Suspense fallback={
        <div role="status" className="text-center text-text-secondary">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">Verifying your payment...</h1>
          <p className="mt-4">Please wait while we confirm your transaction.</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </SectionWrapper>
  );
}
