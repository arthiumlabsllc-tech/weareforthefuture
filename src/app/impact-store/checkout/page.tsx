import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout | For The Future Organization",
  description: "Complete your impact store purchase",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-amber-50">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
            <p className="mt-4 text-sm text-text-secondary">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
