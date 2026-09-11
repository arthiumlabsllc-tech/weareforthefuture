"use client";

import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function DonateSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-primary">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent mx-auto mb-4" />
            <p className="text-text-on-primary/60">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
