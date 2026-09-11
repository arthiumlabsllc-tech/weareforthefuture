"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Phone,
} from "lucide-react";

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
  /** When true, shows MoMo-specific UI with phone field */
  momoMode?: boolean;
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
  momoMode = false,
}: PaystackCheckoutProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(initialEmail || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paystackReady, setPaystackReady] = useState(false);
  const paystackRef = useRef<typeof import("@paystack/inline-js").default | null>(null);

  // Load Paystack inline-js only in the browser (it uses window at module level)
  useEffect(() => {
    import("@paystack/inline-js").then((mod) => {
      paystackRef.current = mod.default;
      setPaystackReady(true);
    }).catch((err) => {
      console.error("[Paystack] Failed to load inline-js:", err);
      setError("Payment system failed to load. Please refresh the page.");
    });
  }, []);

  const handleCheckout = useCallback(async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (momoMode && (!phone || phone.replace(/\D/g, "").length < 10)) {
      setError("Please enter a valid Mobile Money number");
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
          channels: momoMode ? ["mobile_money"] : undefined,
          phone: momoMode && phone ? phone.replace(/\D/g, "") : undefined,
        }),
      });

      const initData = await initRes.json();

      if (!initRes.ok || !initData.success) {
        throw new Error(initData.error || "Failed to start payment");
      }

      // Open Paystack popup using npm package (no CDN script needed)
      if (!paystackRef.current) {
        throw new Error("Payment system not loaded. Please try again.");
      }

      const handler = paystackRef.current.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email: email,
        amount: Math.round(amount * 100), // Convert to pesewas
        currency: "GHS",
        reference: initData.reference,
        accessCode: initData.accessCode,
        label: "For The Future Organization",
        channels: momoMode ? ["mobile_money"] : ["card", "bank_transfer"],
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
  }, [email, phone, amount, metadata, onSuccess, onClose, momoMode, router, source, redirectOnSuccess]);

  const openCheckout = () => {
    setError("");
    setIsOpen(true);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={openCheckout}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-6 py-3.5 text-sm font-bold text-navy-900 shadow-lg transition-all hover:shadow-xl hover:scale-[1.01]"
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
              <div className="w-full max-w-md rounded-2xl bg-surface shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-primary px-6 py-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-text-on-primary">
                      {momoMode ? "Mobile Money Payment" : "Secure Checkout"}
                    </h3>
                    <p className="text-sm text-text-on-primary/50 mt-0.5">
                      {momoMode ? "Pay directly from your MoMo wallet" : "Pay with Mobile Money or Card"}
                    </p>
                  </div>
                  <button
                    onClick={() => !loading && setIsOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-text-on-primary/70 hover:bg-white/20 hover:text-text-on-primary transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                  {/* Amount */}
                  <div className="text-center py-3 rounded-xl bg-bg-tertiary border border-border">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                      Amount to pay
                    </p>
                    <p className="text-3xl font-bold text-text-primary">
                      GH₵{amount.toLocaleString()}
                    </p>
                  </div>

                  {/* Payment Methods */}
                  {!momoMode && (
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Smartphone className="h-4 w-4 text-text-muted" />
                        <span>Mobile Money</span>
                      </div>
                      <div className="h-3 w-px bg-border" />
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <CreditCard className="h-4 w-4 text-text-muted" />
                        <span>Card</span>
                      </div>
                      <div className="h-3 w-px bg-border" />
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Shield className="h-4 w-4 text-text-muted" />
                        <span>Bank</span>
                      </div>
                    </div>
                  )}

                  {momoMode && (
                    <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-success-bg border border-success/20">
                      <Smartphone className="h-5 w-5 text-success-text" />
                      <span className="text-sm font-medium text-success-text">MTN / Vodafone / AirtelTigo</span>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Phone (MoMo mode) */}
                  {momoMode && (
                    <div>
                      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">
                        Mobile Money Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                          type="tel"
                          placeholder="e.g. 0551234987"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value.replace(/[^0-9+ ]/g, ""));
                            setError("");
                          }}
                          className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-success focus:outline-none focus:ring-2 focus:ring-success/20"
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-text-muted">
                        A prompt will be sent to this number to authorize payment
                      </p>
                    </div>
                  )}

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
                    className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed ${
                      momoMode
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {momoMode ? "Sending MoMo prompt..." : "Connecting to Paystack..."}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        {momoMode
                          ? `Authorize GH₵${amount.toLocaleString()} Payment`
                          : `Pay GH₵${amount.toLocaleString()} Securely`
                        }
                      </>
                    )}
                  </button>

                  {/* Security */}
                  <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
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
