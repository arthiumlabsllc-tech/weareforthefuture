"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Smartphone,
  X,
  Mail,
  Lock,
  Check,
  Loader2,
  Shield,
} from "lucide-react";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

interface PaystackCheckoutProps {
  amount: number; // in GHS
  email?: string;
  label?: string;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
  metadata?: Record<string, unknown>;
  /** When true, redirects to /donate/success after payment instead of calling onSuccess */
  redirectOnSuccess?: boolean;
  /** Source identifier: "donation" or "store" */
  source?: "donation" | "store";
}

export default function PaystackCheckout({
  amount,
  email: initialEmail,
  label = "Complete Payment",
  onSuccess,
  onClose,
  metadata,
  redirectOnSuccess = false,
  source = "donation",
}: PaystackCheckoutProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(initialEmail || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paystackReady, setPaystackReady] = useState(false);

  // Load Paystack inline script
  useEffect(() => {
    if (document.getElementById("paystack-inline")) {
      setPaystackReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-inline";
    script.src = "https://js.paystack.co/v2/paystack.js";
    script.async = true;
    script.onload = () => setPaystackReady(true);
    script.onerror = () => setError("Failed to load payment system");
    document.head.appendChild(script);
    return () => {
      // Keep script for reuse
    };
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Initialize transaction via our API
      const initRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount,
          metadata: {
            ...metadata,
            cart_items: metadata?.cart_items,
          },
        }),
      });

      const initData = await initRes.json();

      if (!initRes.ok || !initData.success) {
        throw new Error(initData.error || "Failed to start payment");
      }

      // Open Paystack popup
      if (!window.PaystackPop) {
        throw new Error("Payment system not loaded. Please try again.");
      }

      const handler = window.PaystackPop.setup({
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email: email,
        amount: Math.round(amount * 100), // Convert to pesewas
        currency: "GHS",
        reference: initData.reference,
        accessCode: initData.accessCode,
        label: "For The Future Organization",
        channels: ["mobile_money", "card", "bank_transfer"],
        metadata: {
          custom_fields: [
            {
              display_name: "Organization",
              variable_name: "organization",
              value: "For The Future Organization",
            },
          ],
          ...metadata,
        },
        onSuccess: (response: { reference: string }) => {
          setLoading(false);
          setIsOpen(false);
          if (redirectOnSuccess) {
            // Redirect to success page with verification
            router.push(`/donate/success?reference=${response.reference}&source=${source}`);
          } else {
            onSuccess?.(response.reference);
          }
        },
        onClose: () => {
          setLoading(false);
          onClose?.();
        },
      });

      handler.openIframe();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }, [email, amount, metadata, onSuccess, onClose]);

  const openCheckout = () => {
    setError("");
    setIsOpen(true);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={openCheckout}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3.5 text-sm font-bold text-navy-900 shadow-lg transition-all hover:shadow-xl hover:scale-[1.01]"
      >
        <CreditCard className="h-4 w-4" />
        {label}
      </button>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
              onClick={() => !loading && setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[210] flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-navy-900 px-6 py-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Secure Checkout
                    </h3>
                    <p className="text-sm text-white/50 mt-0.5">
                      Pay with Mobile Money or Card
                    </p>
                  </div>
                  <button
                    onClick={() => !loading && setIsOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  {/* Amount */}
                  <div className="text-center py-3 rounded-xl bg-navy-50 border border-navy-100">
                    <p className="text-xs text-navy-500 uppercase tracking-wider mb-1">
                      Amount to pay
                    </p>
                    <p className="text-3xl font-bold text-navy-900">
                      GH₵{amount.toLocaleString()}
                    </p>
                  </div>

                  {/* Payment Methods */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-navy-500">
                      <Smartphone className="h-4 w-4 text-navy-400" />
                      <span>Mobile Money</span>
                    </div>
                    <div className="h-3 w-px bg-navy-200" />
                    <div className="flex items-center gap-1.5 text-xs text-navy-500">
                      <CreditCard className="h-4 w-4 text-navy-400" />
                      <span>Card</span>
                    </div>
                    <div className="h-3 w-px bg-navy-200" />
                    <div className="flex items-center gap-1.5 text-xs text-navy-500">
                      <Shield className="h-4 w-4 text-navy-400" />
                      <span>Bank</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1.5 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        className="w-full rounded-xl border border-navy-200 bg-white py-3 pl-10 pr-4 text-sm text-navy-900 placeholder:text-navy-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm text-red-500 text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Pay Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={loading || !paystackReady}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting to Paystack...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Pay GH₵{amount.toLocaleString()} Securely
                      </>
                    )}
                  </button>

                  {/* Security */}
                  <div className="flex items-center justify-center gap-2 text-xs text-navy-400">
                    <Lock className="h-3 w-3" />
                    <span>
                      Secured by Paystack. Your payment info is encrypted.
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
