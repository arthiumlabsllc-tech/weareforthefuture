"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Smartphone,
  Loader2,
  Lock,
  Package,
  HandHeart,
  Check,
} from "lucide-react";
import { getRegions, getCities, calculateDeliveryFee } from "@/lib/delivery";
import { products } from "@/data/store";

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
  qty: number;
}

const MOMO_PROVIDERS = [
  { value: "mtn", label: "MTN Mobile Money" },
  { value: "vod", label: "Vodafone Cash" },
  { value: "tgo", label: "AirtelTigo Money" },
];

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cart state from localStorage
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"home_delivery" | "pickup">("home_delivery");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [momoProvider, setMomoProvider] = useState("mtn");
  const [momoPhone, setMomoPhone] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paystackReady, setPaystackReady] = useState(false);
  const paystackRef = useRef<typeof import("@paystack/inline-js").default | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ftf-cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Map stored cart items to include product data
        const mapped: CartItem[] = parsed
          .map((item: { product: CartItem["product"]; qty: number }) => {
            const product = products.find((p) => p.id === item.product.id);
            if (!product) return null;
            return { product, qty: item.qty };
          })
          .filter(Boolean);
        setCart(mapped);
      }
    } catch {
      // ignore
    }
    setCartLoaded(true);
  }, []);

  // Load Paystack inline-js
  useEffect(() => {
    import("@paystack/inline-js").then((mod) => {
      paystackRef.current = mod.default;
      setPaystackReady(true);
    }).catch((err) => {
      console.error("[Checkout] Failed to load Paystack:", err);
    });
  }, []);

  // Pre-fill email from query param
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const regions = useMemo(() => getRegions(), []);
  const cities = useMemo(() => (region ? getCities(region) : []), [region]);

  // Calculate totals
  const subtotalGhs = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const subtotalPesewas = subtotalGhs * 100;

  const deliveryFeePesewas = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    if (!region || !city) return 0;
    return calculateDeliveryFee(
      region,
      city,
      cart.map((i) => ({ id: i.product.id, price: i.product.price, qty: i.qty })),
      subtotalPesewas
    );
  }, [deliveryMethod, region, city, cart, subtotalPesewas]);

  const totalPesewas = subtotalPesewas + deliveryFeePesewas;
  const totalGhs = totalPesewas / 100;

  // Reset city when region changes
  useEffect(() => {
    setCity("");
  }, [region]);

  const handleSubmit = useCallback(async () => {
    setError("");

    // Validate
    if (!customerName.trim()) { setError("Please enter your full name"); return; }
    if (!email.includes("@")) { setError("Please enter a valid email address"); return; }
    if (phone.replace(/\D/g, "").length < 10) { setError("Please enter a valid phone number"); return; }
    if (!agreedToTerms) { setError("Please agree to the terms and refund policy"); return; }

    if (deliveryMethod === "home_delivery") {
      if (!region) { setError("Please select your region"); return; }
      if (!city) { setError("Please select your city/town"); return; }
      if (!streetAddress.trim()) { setError("Please enter your street address"); return; }
    }

    if (!momoPhone || momoPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid MoMo phone number");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Create order via API
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          deliveryMethod,
          region: deliveryMethod === "home_delivery" ? region : null,
          city: deliveryMethod === "home_delivery" ? city : null,
          area: deliveryMethod === "home_delivery" ? area.trim() : null,
          streetAddress: deliveryMethod === "home_delivery" ? streetAddress.trim() : null,
          notes: notes.trim() || null,
          momoProvider,
          momoPhone: momoPhone.replace(/\D/g, ""),
          items: cart.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.qty,
          })),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const { orderId } = orderData.order;

      // Step 2: Initialize Paystack transaction
      const initRes = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          amount: totalGhs,
          metadata: {
            order_id: orderId,
            source: "impact_store",
            cart_items: cart.map((item) => ({
              name: item.product.name,
              id: item.product.id,
              quantity: item.qty,
              price: item.product.price,
            })),
            customer_name: customerName.trim(),
            delivery_method: deliveryMethod,
            delivery_fee: deliveryFeePesewas,
          },
          channels: ["mobile_money"],
          phone: momoPhone.replace(/\D/g, ""),
        }),
      });

      const initData = await initRes.json();

      if (!initRes.ok || !initData.success) {
        throw new Error(initData.error || "Failed to start payment");
      }

      // Step 3: Update order with payment reference
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_KEY || "",
        },
        body: JSON.stringify({
          paymentReference: initData.reference,
        }),
      });

      // Step 4: Open Paystack popup
      if (!paystackRef.current) {
        throw new Error("Payment system not loaded. Please refresh and try again.");
      }

      const handler = paystackRef.current.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        email: email.trim(),
        amount: Math.round(totalPesewas),
        currency: "GHS",
        reference: initData.reference,
        accessCode: initData.accessCode,
        label: "For The Future Organization",
        channels: ["mobile_money"],
        metadata: {
          order_id: orderId,
          custom_fields: [
            {
              display_name: "Organization",
              variable_name: "organization",
              value: "For The Future Organization",
            },
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: orderId,
            },
          ],
        },
        onSuccess: () => {
          // Clear cart
          localStorage.removeItem("ftf-cart");
          setCart([]);
          // Redirect to success page
          router.push(`/donate/success?reference=${initData.reference}&source=store`);
        },
        onClose: () => {
          setSubmitting(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setSubmitting(false);
    }
  }, [customerName, email, phone, deliveryMethod, region, city, area, streetAddress, notes, momoProvider, momoPhone, agreedToTerms, cart, totalGhs, totalPesewas, deliveryFeePesewas, router, paystackRef]);

  // Empty cart state
  if (cartLoaded && cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-tertiary">
            <ShoppingBag className="h-10 w-10 text-text-muted" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Your cart is empty</h1>
          <p className="text-text-secondary mb-6">Add items to your cart before checking out.</p>
          <Link
            href="/impact-store"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-text-on-primary hover:bg-primary-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  if (!cartLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <Loader2 className="h-8 w-8 animate-spin text-text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 pt-28 pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Back link */}
        <Link
          href="/impact-store"
          className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>

        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary mb-8">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* LEFT: Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
              <div className="bg-primary px-6 py-4">
                <h2 className="text-lg font-bold text-text-on-primary flex items-center gap-2">
                  <Package className="h-5 w-5 text-accent-text" />
                  Order Summary
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bg-tertiary">
                      <ShoppingBag className="h-5 w-5 text-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{item.product.name}</p>
                      <p className="text-xs text-text-tertiary">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-bold text-text-primary">GH₵{item.product.price * item.qty}</p>
                  </div>
                ))}

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="font-semibold text-text-primary">GH₵{subtotalGhs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Delivery</span>
                    <span className="font-semibold text-text-primary">
                      {deliveryFeePesewas === 0
                        ? deliveryMethod === "pickup"
                          ? "FREE (Pickup)"
                          : region && city
                          ? "FREE"
                          : "--"
                        : `GH₵${(deliveryFeePesewas / 100).toFixed(0)}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-base font-bold text-text-primary">Total</span>
                    <span className="text-xl font-bold text-text-primary">GH₵{totalGhs}</span>
                  </div>
                </div>

                {/* Impact message */}
                <div className="flex items-center gap-2 rounded-xl bg-success-bg px-4 py-3 border border-success/20">
                  <HandHeart className="h-5 w-5 text-success-text shrink-0" />
                  <p className="text-xs font-medium text-success-text">
                    100% of proceeds fund children&apos;s programs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Checkout Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Contact Information */}
            <div className="rounded-2xl bg-surface border border-border shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-accent-text" />
                Contact Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Kwame Asante"
                      className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kwame@email.com"
                      className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9+ ]/g, ""))}
                      placeholder="0244 123 456"
                      className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="rounded-2xl bg-surface border border-border shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-accent-text" />
                Delivery Method
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("home_delivery")}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    deliveryMethod === "home_delivery"
                      ? "border-accent bg-accent-subtle"
                      : "border-border-strong hover:border-border"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    deliveryMethod === "home_delivery" ? "bg-accent text-text-primary" : "bg-bg-tertiary text-text-tertiary"
                  }`}>
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Home Delivery</p>
                    <p className="text-xs text-text-tertiary">Delivered to your doorstep</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    deliveryMethod === "pickup"
                      ? "border-accent bg-accent-subtle"
                      : "border-border-strong hover:border-border"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    deliveryMethod === "pickup" ? "bg-accent text-text-primary" : "bg-bg-tertiary text-text-tertiary"
                  }`}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Pickup at FTF Office</p>
                    <p className="text-xs text-text-tertiary">No delivery fee</p>
                  </div>
                </button>
              </div>

              {/* Address fields (only for home delivery) */}
              {deliveryMethod === "home_delivery" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                        Region *
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full rounded-xl border border-border-strong bg-surface py-3 px-4 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      >
                        <option value="">Select region</option>
                        {regions.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                        City/Town *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        disabled={!region}
                        className="w-full rounded-xl border border-border-strong bg-surface py-3 px-4 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
                      >
                        <option value="">{region ? "Select city" : "Select region first"}</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                      Area/Neighborhood
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. East Legon, Adenta"
                      className="w-full rounded-xl border border-border-strong bg-surface py-3 px-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                      Street Address / Landmark *
                    </label>
                    <textarea
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="House number, street name, nearest landmark"
                      rows={2}
                      className="w-full rounded-xl border border-border-strong bg-surface py-3 px-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Additional notes */}
              <div className="mt-4">
                <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call when you arrive, gate code is 1234"
                  rows={2}
                  className="w-full rounded-xl border border-border-strong bg-surface py-3 px-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>
            </div>

            {/* Payment Details */}
            <div className="rounded-2xl bg-surface border border-border shadow-sm p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-accent-text" />
                Mobile Money Payment
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                    MoMo Provider
                  </label>
                  <select
                    value={momoProvider}
                    onChange={(e) => setMomoProvider(e.target.value)}
                    className="w-full rounded-xl border border-border-strong bg-surface py-3 px-4 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    {MOMO_PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5 block">
                    MoMo Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value.replace(/[^0-9+ ]/g, ""))}
                      placeholder="0244 123 456"
                      className="w-full rounded-xl border border-border-strong bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-success focus:outline-none focus:ring-2 focus:ring-success/20"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-text-muted">
                    A payment prompt will be sent to this number
                  </p>
                </div>
              </div>
            </div>

            {/* Terms + Submit */}
            <div className="rounded-2xl bg-surface border border-border shadow-sm p-6">
              {/* Terms checkbox */}
              <label className="flex items-start gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-accent-text focus:ring-accent"
                />
                <span className="text-sm text-text-secondary">
                  I agree to the terms and conditions and the refund policy.
                </span>
              </label>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 text-center mb-4"
                >
                  {error}
                </motion.p>
              )}

              {/* Pay Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !paystackReady || cart.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-success to-success-hover px-6 py-4 text-sm font-bold text-text-on-primary shadow-lg transition-all hover:shadow-xl hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Pay GH₵{totalGhs} with Mobile Money
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-text-muted mt-3">
                <Lock className="h-3 w-3" />
                <span>Secured by Paystack. Your payment info is encrypted.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
