"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Check,
  Loader2,
  AlertCircle,
  Home,
  ArrowRight,
  Mail,
  Sparkles,
  PartyPopper,
} from "lucide-react";

interface VerifiedTransaction {
  status: string;
  amount: number;
  currency: string;
  paidAt: string;
  channel: string;
  customer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  gatewayResponse: string;
}

/* ===== CONFETTI ===== */
function ConfettiPiece({ delay, color, left }: { delay: number; color: string; left: number }) {
  return (
    <motion.div
      initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
      animate={{
        y: [null, typeof window !== "undefined" ? window.innerHeight + 20 : 1000],
        x: [0, (Math.random() - 0.5) * 200],
        rotate: [0, Math.random() * 720 - 360],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        ease: "easeIn",
      }}
      className="absolute top-0 w-2 h-3 rounded-sm"
      style={{
        left: `${left}%`,
        backgroundColor: color,
      }}
    />
  );
}

const COLORS = ["#D4A843", "#10B981", "#F97316", "#3B82F6", "#EC4899", "#8B5CF6", "#EF4444", "#14B8A6"];

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const source = searchParams.get("source") || "donation";

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [transaction, setTransaction] = useState<VerifiedTransaction | null>(null);
  const [error, setError] = useState("");

  const confetti = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        delay: Math.random() * 1.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        left: Math.random() * 100,
      })),
    []
  );

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      setError("No transaction reference found. If you completed a payment, please contact us.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();

        if (data.success && data.verified) {
          setVerified(true);
          setTransaction({
            status: data.status,
            amount: data.amount / 100,
            currency: data.currency,
            paidAt: data.paidAt,
            channel: data.channel,
            customer: data.customer,
            gatewayResponse: data.gatewayResponse,
          });
        } else {
          setError("We couldn't verify this transaction. Please contact us with your reference number.");
        }
      } catch {
        setError("Verification failed. Your payment may still be processing. Please check your email for confirmation.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [reference]);

  const isStore = source === "store";
  const displayName = transaction?.customer?.first_name
    ? `${transaction.customer.first_name} ${transaction.customer.last_name || ""}`.trim()
    : transaction?.customer?.email || "Generous Donor";

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-primary via-primary to-primary overflow-hidden">
      {/* Confetti */}
      {verified && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {confetti.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              delay={piece.delay}
              color={piece.color}
              left={piece.left}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-20 flex items-start justify-center min-h-screen px-4 pt-36 pb-16">
        <div className="w-full max-w-lg">
          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Loader2 className="h-12 w-12 text-accent animate-spin mx-auto mb-4" />
              <p className="text-lg text-text-on-primary/70">Verifying your payment...</p>
              <p className="text-sm text-text-on-primary/40 mt-2">Please wait while we confirm your transaction</p>
            </motion.div>
          )}

          {/* Error State */}
          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 border border-amber-400/20 mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-amber-400" />
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-on-primary mb-3">
                Verification Pending
              </h1>
              <p className="text-text-on-primary/60 leading-relaxed mb-6">{error}</p>
              {reference && (
                <div className="rounded-xl bg-text-on-primary/5 border border-text-on-primary/10 p-4 mb-6">
                  <p className="text-xs text-text-on-primary/40 mb-1">Reference</p>
                  <p className="text-sm text-text-on-primary font-mono">{reference}</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-3 text-sm font-semibold text-primary-contrast"
                >
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-text-on-primary/20 px-8 py-3 text-sm font-semibold text-text-on-primary hover:bg-text-on-primary/10"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {!loading && verified && transaction && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className="relative mx-auto mb-6"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10 border-2 border-success/30">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <Check className="h-12 w-12 text-success-text" strokeWidth={3} />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="absolute -top-2 -right-2"
                >
                  <PartyPopper className="h-8 w-8 text-accent" />
                </motion.div>
              </motion.div>

              {/* Thank You Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 text-xs font-semibold text-accent uppercase tracking-wider mb-4">
                  <Sparkles className="h-3 w-3" />
                  Payment Confirmed
                </span>
                <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-on-primary sm:text-4xl mb-3">
                  {isStore ? "Thank You for Your Purchase!" : "Thank You, " + displayName.split(" ")[0] + "!"}
                </h1>
                <p className="text-lg text-text-on-primary/60 leading-relaxed mb-6">
                  {isStore
                    ? "Your order has been placed successfully. Every purchase directly changes a child's life."
                    : "Your generous donation has been received. You're directly changing the lives of underprivileged children across Ghana, Nigeria, and beyond."}
                </p>
              </motion.div>

              {/* Transaction Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl bg-text-on-primary/5 border border-text-on-primary/10 p-6 mb-6 text-left space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-on-primary/50">Amount</span>
                  <span className="text-2xl font-bold text-text-on-primary">
                    GH₵{transaction.amount.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-text-on-primary/10" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-on-primary/40 mb-0.5">Reference</p>
                    <p className="text-sm text-text-on-primary font-mono truncate">{reference}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-on-primary/40 mb-0.5">Payment Method</p>
                    <p className="text-sm text-text-on-primary capitalize">
                      {transaction.channel === "mobile_money"
                        ? "Mobile Money"
                        : transaction.channel === "bank_transfer"
                        ? "Bank Transfer"
                        : transaction.channel || "Card"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-on-primary/40 mb-0.5">Status</p>
                    <p className="text-sm text-success-text font-semibold flex items-center gap-1">
                      <Check className="h-3 w-3" /> Successful
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-on-primary/40 mb-0.5">Date</p>
                    <p className="text-sm text-text-on-primary">
                      {new Date(transaction.paidAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Email Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-2 text-sm text-text-on-primary/50 mb-8"
              >
                <Mail className="h-4 w-4" />
                A receipt has been sent to{" "}
                <span className="text-text-on-primary/70 font-medium">
                  {transaction.customer?.email || "your email"}
                </span>
              </motion.div>

              {/* Tax Notice */}
              {!isStore && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="rounded-xl bg-success/10 border border-success/20 p-4 mb-8"
                >
                  <Heart className="h-5 w-5 text-success-text mx-auto mb-2" />
                  <p className="text-sm text-success-text font-medium">
                    Your donation is tax-deductible. For The Future Organization is a registered 501(c)(3) nonprofit.
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col gap-3 sm:flex-row sm:justify-center"
              >
                {isStore ? (
                  <Link
                    href="/impact-store"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-3 text-sm font-semibold text-primary-contrast shadow-lg transition-all hover:scale-[1.02]"
                  >
                    <Home className="h-4 w-4" />
                    Continue Shopping
                  </Link>
                ) : (
                  <Link
                    href="/donate"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-3 text-sm font-semibold text-primary-contrast shadow-lg transition-all hover:scale-[1.02]"
                  >
                    <Heart className="h-4 w-4" />
                    Donate Again
                  </Link>
                )}
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-text-on-primary/20 px-8 py-3 text-sm font-semibold text-text-on-primary transition-all hover:bg-text-on-primary/10"
                >
                  Back to Home
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* No reference at all */}
          {!loading && !reference && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-text-on-primary/5 border border-text-on-primary/10 mx-auto mb-6">
                <Heart className="h-10 w-10 text-accent" />
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-on-primary mb-3">
                Thank You for Your Support!
              </h1>
              <p className="text-text-on-primary/60 leading-relaxed mb-6">
                Your generosity changes lives. If you just completed a payment, you'll receive a confirmation email shortly.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-3 text-sm font-semibold text-primary-contrast"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
