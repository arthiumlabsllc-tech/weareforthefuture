"use client";

import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function DonateSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-navy-900">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-400 border-t-transparent mx-auto mb-4" />
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
