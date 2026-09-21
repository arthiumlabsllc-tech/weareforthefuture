"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { img } from "@/lib/imageUrl";
import {
  Heart,
  CreditCard,
  Building2,
  Smartphone,
  Shield,
  Check,
  HandHeart,
  BookOpen,
  Utensils,
  Stethoscope,
  User,
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { siteConfig } from "@/data/site";
import PaystackCheckout from "@/components/ui/PaystackCheckout";

const donationTiers = [
  { amount: 100, label: "GH₵100", impact: "Provides school supplies for 5 children for a month", icon: BookOpen },
  { amount: 250, label: "GH₵250", impact: "Feeds 20 children for a week at our community programs", icon: Utensils },
  { amount: 500, label: "GH₵500", impact: "Provides menstrual health kits for 25 girls for 3 months", icon: Heart },
  { amount: 1000, label: "GH₵1,000", impact: "Sponsors a child's full school tuition for one term", icon: HandHeart },
  { amount: 2500, label: "GH₵2,500", impact: "Funds a complete digital literacy workshop for 30 youth", icon: Sparkles },
  { amount: 5000, label: "GH₵5,000", impact: "Builds a classroom library serving 100+ children", icon: BookOpen },
];

const quickAmounts = [50, 100, 250, 500, 1000, 2500];

type PaymentMethod = "paystack" | "momo" | "bank" | "gofundme";

export default function DonateClient() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(250);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("paystack");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    anonymous: false,
  });

  const activeAmount = customAmount ? Number(customAmount) : selectedAmount;

  // Auto-fill donor details if supporter is logged in
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    fetch("/api/supporter/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.supporter) {
          const s = data.supporter;
          setSignedIn(true);
          const nameParts = (s.name || "").split(" ");
          setFormData((prev) => ({
            ...prev,
            firstName: prev.firstName || nameParts[0] || "",
            lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
            email: prev.email || s.email || "",
            phone: prev.phone || s.phone || "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleTierSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleQuickAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val.replace(/[^0-9]/g, ""));
    setSelectedAmount(null);
  };

  const handleProceedToPayment = () => {
    if (!activeAmount || activeAmount <= 0) return;
    setShowForm(true);
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={img("/images/page-heroes/donate-hero.png")}
            alt="Donate"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-primary/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-primary/70" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,rgba(212,168,67,0.15),transparent_50%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-5 py-2 text-xs font-semibold text-accent-text uppercase tracking-wider mb-4 backdrop-blur-sm">
              <Heart className="h-3.5 w-3.5" />
              Make a Difference
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] text-text-on-primary sm:text-5xl md:text-6xl">
              Your Generosity Changes Lives
            </h1>
            <p className="mt-6 max-w-xl text-lg text-text-on-primary/70 leading-relaxed">
              Every cedi you give directly supports education, healthcare, and
              empowerment programs for vulnerable children. 501(c)(3) -
              contributions are tax-deductible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== DONATION FORM SECTION ===== */}
      <SectionWrapper background="white">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-5">
            {/* LEFT: Amount Selection (3 cols) */}
            <div className="lg:col-span-3 space-y-8">
              {/* Frequency Toggle */}
              <div>
                <label className="text-sm font-semibold text-text-primary mb-3 block">
                  How often would you like to give?
                </label>
                <div className="inline-flex rounded-xl bg-bg-tertiary p-1">
                  {(["one-time", "monthly"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all capitalize ${
                        frequency === f
                          ? "bg-primary text-text-on-primary shadow-lg"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {f === "one-time" ? "One-Time" : "Monthly"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset Tiers */}
              <div>
                <label className="text-sm font-semibold text-text-primary mb-3 block">
                  Choose an amount
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {donationTiers.map((tier) => (
                    <motion.button
                      key={tier.amount}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTierSelect(tier.amount)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        selectedAmount === tier.amount
                          ? "border-accent bg-accent-subtle shadow-lg shadow-accent/10"
                          : "border-border bg-surface hover:border-border-strong"
                      }`}
                    >
                      <span className="text-xl font-bold text-text-primary">
                        {tier.label}
                      </span>
                      {selectedAmount === tier.amount && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-accent-text">
                          <Check className="h-3 w-3" />
                          Selected
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quick Amounts + Custom */}
              <div>
                <label className="text-sm font-semibold text-text-primary mb-3 block">
                  Or enter a custom amount
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleQuickAmount(amt)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        selectedAmount === amt && !customAmount
                          ? "bg-primary text-text-on-primary"
                          : "bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary"
                      }`}
                    >
                      GH₵{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">
                    GH₵
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    className="w-full rounded-xl border-2 border-border-strong bg-surface py-3.5 pl-14 pr-6 text-lg font-semibold text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>

              {/* Impact Message */}
              <AnimatePresence mode="wait">
                {activeAmount && activeAmount > 0 && (
                  <motion.div
                    key={activeAmount}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-3 rounded-xl bg-success-bg border border-success/20 p-4"
                  >
                    <Heart className="h-5 w-5 text-success-text shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-success-text">
                      {activeAmount >= 5000
                        ? "You're building lasting infrastructure for children's futures!"
                        : activeAmount >= 2500
                        ? "You're funding a complete digital literacy workshop!"
                        : activeAmount >= 1000
                        ? "You're sponsoring a child's full school tuition!"
                        : activeAmount >= 500
                        ? "You're providing menstrual health kits for 25 girls!"
                        : activeAmount >= 250
                        ? "You're feeding 20 children for a week!"
                        : activeAmount >= 100
                        ? "You're providing school supplies for 5 children!"
                        : "Every cedi makes a difference in a child's life!"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT: Summary & Payment (2 cols) */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-2xl border border-border bg-surface shadow-xl shadow-primary/5 overflow-hidden">
                {/* Summary Header */}
                <div className="bg-primary px-6 py-5">
                  <h3 className="text-lg font-bold text-text-on-primary">
                    Donation Summary
                  </h3>
                  <p className="text-sm text-text-on-primary/50 mt-0.5">
                    Review your contribution details
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  {/* Amount Display */}
                  <div className="text-center py-4">
                    <p className="text-sm text-text-tertiary mb-1">
                      {frequency === "monthly" ? "Monthly donation" : "One-time donation"}
                    </p>
                    <p className="text-4xl font-bold text-text-primary">
                      {activeAmount ? `GH₵${activeAmount.toLocaleString()}` : "GH₵0"}
                    </p>
                    {frequency === "monthly" && activeAmount && (
                      <p className="text-xs text-text-muted mt-1">
                        GH₵{(activeAmount * 12).toLocaleString()} per year
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Payment Method */}
                  <div>
                    <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 block">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setPaymentMethod("paystack")}
                        className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                          paymentMethod === "paystack"
                            ? "border-accent bg-accent-subtle"
                            : "border-border hover:border-border-strong"
                        }`}
                      >
                        <CreditCard className={`h-5 w-5 ${paymentMethod === "paystack" ? "text-accent-text" : "text-text-muted"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text-primary">Card / Bank</p>
                          <p className="text-xs text-text-tertiary">Visa, Mastercard, Bank Transfer</p>
                        </div>
                        {paymentMethod === "paystack" && <Check className="h-4 w-4 text-accent-text" />}
                      </button>
                      <button
                        onClick={() => setPaymentMethod("momo")}
                        className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                          paymentMethod === "momo"
                            ? "border-accent bg-accent-subtle"
                            : "border-border hover:border-border-strong"
                        }`}
                      >
                        <Smartphone className={`h-5 w-5 ${paymentMethod === "momo" ? "text-accent-text" : "text-text-muted"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text-primary">Mobile Money</p>
                          <p className="text-xs text-text-tertiary">MTN MoMo</p>
                        </div>
                        {paymentMethod === "momo" && <Check className="h-4 w-4 text-accent-text" />}
                      </button>
                      <button
                        onClick={() => setPaymentMethod("bank")}
                        className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                          paymentMethod === "bank"
                            ? "border-accent bg-accent-subtle"
                            : "border-border hover:border-border-strong"
                        }`}
                      >
                        <Building2 className={`h-5 w-5 ${paymentMethod === "bank" ? "text-accent-text" : "text-text-muted"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text-primary">Direct Bank Transfer</p>
                          <p className="text-xs text-text-tertiary">Ecobank Ghana</p>
                        </div>
                        {paymentMethod === "bank" && <Check className="h-4 w-4 text-accent-text" />}
                      </button>
                      <button
                        onClick={() => setPaymentMethod("gofundme")}
                        className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                          paymentMethod === "gofundme"
                            ? "border-accent bg-accent-subtle"
                            : "border-border hover:border-border-strong"
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${paymentMethod === "gofundme" ? "text-accent-text" : "text-text-muted"}`} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text-primary">GoFundMe</p>
                          <p className="text-xs text-text-tertiary">Start a fundraiser or donate</p>
                        </div>
                        {paymentMethod === "gofundme" && <Check className="h-4 w-4 text-accent-text" />}
                      </button>
                    </div>
                  </div>

                  {/* MoMo Direct Payment */}
                  <AnimatePresence>
                    {paymentMethod === "momo" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl bg-success-bg border border-success/20 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-success-text" />
                            <p className="text-sm font-semibold text-success-text">Pay Directly via Mobile Money</p>
                          </div>
                          <p className="text-sm text-success-text">
                            Enter your MoMo number below. A payment prompt will be sent to your phone - simply authorize it with your PIN to complete the donation.
                          </p>
                          <div className="text-xs text-success-text space-y-1">
                            <p>Supported networks: MTN, Vodafone, AirtelTigo</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bank Details */}
                  <AnimatePresence>
                    {paymentMethod === "bank" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl bg-bg-tertiary p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Bank Details</p>
                            <span className="text-[10px] font-bold text-text-muted bg-bg-tertiary rounded px-1.5 py-0.5">ECOBANK</span>
                          </div>
                          <p className="text-sm font-semibold text-text-primary">
                            {siteConfig.donation.bankAccount.name}
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 border border-border">
                              <div>
                                <p className="text-[10px] text-text-muted uppercase tracking-wider">GH₵ Cedi Account</p>
                                <p className="text-sm font-semibold text-text-primary font-mono">
                                  {siteConfig.donation.bankAccount.ghs.account}
                                </p>
                              </div>
                              <p className="text-xs text-text-tertiary">{siteConfig.donation.bankAccount.ghs.branch}</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 border border-border">
                              <div>
                                <p className="text-[10px] text-text-muted uppercase tracking-wider">USD$ Account</p>
                                <p className="text-sm font-semibold text-text-primary font-mono">
                                  {siteConfig.donation.bankAccount.usd.account}
                                </p>
                              </div>
                              <p className="text-xs text-text-tertiary">{siteConfig.donation.bankAccount.usd.branch}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* GoFundMe Details */}
                  <AnimatePresence>
                    {paymentMethod === "gofundme" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl bg-bg-tertiary p-4 space-y-3">
                          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">GoFundMe</p>
                          <p className="text-sm text-text-secondary">
                            Start your own fundraiser or make a direct donation through our GoFundMe campaign.
                          </p>
                          <ul className="space-y-1.5">
                            {["Create a fundraiser", "Share with your network", "Track your impact"].map((item) => (
                              <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                                <div className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                          <a
                            href={siteConfig.donation.goFundMeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-text hover:text-accent-text"
                          >
                            Visit GoFundMe
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Donate Button */}
                  {paymentMethod === "paystack" || paymentMethod === "momo" ? (
                    activeAmount && activeAmount > 0 ? (
                      <PaystackCheckout
                        amount={activeAmount}
                        email={formData.email || undefined}
                        label={
                          paymentMethod === "momo"
                            ? `Donate GH₵${activeAmount.toLocaleString()} via MoMo`
                            : `Donate GH₵${activeAmount.toLocaleString()}${frequency === "monthly" ? " / month" : ""}`
                        }
                        redirectOnSuccess
                        source="donation"
                        momoMode={paymentMethod === "momo"}
                        metadata={{
                          source: "donation_page",
                          frequency,
                          donation_amount: activeAmount,
                          payment_channel: paymentMethod,
                          donor_name: [formData.firstName, formData.lastName].filter(Boolean).join(" ") || undefined,
                          donor_phone: formData.phone || undefined,
                          donor_message: formData.message || undefined,
                          anonymous: formData.anonymous,
                        }}
                      />
                    ) : (
                      <button
                        disabled
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-border-strong px-6 py-4 text-sm font-bold text-text-muted cursor-not-allowed"
                      >
                        Select an amount first
                      </button>
                    )
                  ) : paymentMethod === "gofundme" ? (
                    <a
                      href={siteConfig.donation.goFundMeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-sm font-bold text-text-on-primary shadow-lg transition-all hover:shadow-xl hover:scale-[1.01]"
                    >
                      <Heart className="h-4 w-4" />
                      Visit GoFundMe
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      onClick={handleProceedToPayment}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-cta px-6 py-4 text-sm font-bold text-on-cta shadow-lg transition-all hover:bg-cta-hover hover:shadow-xl hover:scale-[1.01]"
                    >
                      <Heart className="h-4 w-4" />
                      {showForm ? "Close Form" : "I've Made the Transfer"}
                    </button>
                  )}

                  {/* Security Note */}
                  <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                    <Shield className="h-3.5 w-3.5 text-success" />
                    Secure & tax-deductible. 501(c)(3) organization.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Donor Form (shown for non-Paystack methods) */}
          <AnimatePresence>
            {showForm && paymentMethod !== "paystack" && paymentMethod !== "momo" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-10 mx-auto max-w-2xl"
              >
                <div className="rounded-2xl border border-border bg-surface p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-text-primary">Your Details</h3>
                      <p className="text-sm text-text-tertiary mt-1">
                        So we can send you a receipt and say thank you
                      </p>
                    </div>
                    {signedIn && (
                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                        Signed in
                      </span>
                    )}
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-tertiary text-text-muted hover:bg-bg-tertiary hover:text-text-secondary"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                          First Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                          <input
                            type="text"
                            placeholder="Kwame"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                          Last Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                          <input
                            type="text"
                            placeholder="Asiedua"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                          type="email"
                          placeholder="kwame@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                        Phone Number (optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                          type="tel"
                          placeholder="+233 54 000 0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                        Leave a Message (optional)
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                        <textarea
                          rows={3}
                          placeholder="Share why you're giving or a note for the children..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                        />
                      </div>
                    </div>

                    {/* Anonymous toggle */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setFormData({ ...formData, anonymous: !formData.anonymous })}
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                          formData.anonymous
                            ? "border-accent bg-accent"
                            : "border-border bg-surface"
                        }`}
                      >
                        {formData.anonymous && <Check className="h-3 w-3 text-navy-900" />}
                      </div>
                      <span className="text-sm text-text-secondary">
                        Make my donation anonymous
                      </span>
                    </label>

                    {/* Submit */}
                    <button className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-text-on-primary shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl">
                      Submit & Send Receipt
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <p className="text-center text-xs text-text-muted">
                      Your information is secure and will never be shared.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionWrapper>

      {/* ===== FUNDRAISING PROGRESS ===== */}
      <SectionWrapper background="warm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-text">
            Current Campaign
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary md:text-4xl">
            FTF Village Project
          </h2>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Help us raise GH₵ 500,000 to build a home for orphans and vulnerable
            children in Ghana.
          </p>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-text-primary">
                {siteConfig.donation.villageCurrency}
                {siteConfig.donation.villageRaised.toLocaleString()}
              </span>
              <span className="text-sm text-text-tertiary">
                Goal: {siteConfig.donation.villageCurrency}
                {siteConfig.donation.villageGoal.toLocaleString()}
              </span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-bg-tertiary">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{
                  width: `${
                    (siteConfig.donation.villageRaised /
                      siteConfig.donation.villageGoal) *
                    100
                  }%`,
                }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full bg-cta"
              />
            </div>
            <p className="mt-2 text-sm text-text-tertiary">
              {Math.round(
                (siteConfig.donation.villageRaised /
                  siteConfig.donation.villageGoal) *
                  100
              )}
              % of goal reached
            </p>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* ===== IMPACT TIERS ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="Your Impact"
          title="See What Your Donation Can Do"
          description="Every amount creates real, measurable change in a child's life."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {donationTiers.map((tier, i) => (
            <motion.div
              key={tier.amount}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-2xl border border-border bg-surface p-6 transition-all hover:shadow-lg hover:border-accent"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
                  <tier.icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-text-primary">
                  {tier.label}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {tier.impact}
              </p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== TAX NOTICE ===== */}
      <SectionWrapper background="navy">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <Shield className="h-12 w-12 text-success mx-auto mb-4" />
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-text-on-primary md:text-3xl">
            Your Donation is Tax-Deductible
          </h2>
          <p className="mt-4 text-lg text-text-on-primary/60 leading-relaxed">
            For The Future Organization is a registered 501(c)(3) nonprofit
            organization. All contributions are tax-deductible to the extent
            permitted by law. You will receive a receipt for your records.
          </p>
        </motion.div>
      </SectionWrapper>
    </>
  );
}
