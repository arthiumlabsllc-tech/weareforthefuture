"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  ArrowRight,
  Plus,
  Minus,
  X,
  Trash2,
  Sparkles,
  HandHeart,
  Check,
  ExternalLink,
  ShoppingBag as CartIcon,
  CreditCard,
  PartyPopper,
} from "lucide-react";
import SectionWrapper, { SectionHeader } from "@/components/ui/SectionWrapper";
import { products, storeCategories, type Product } from "@/data/store";
import PaystackCheckout from "@/components/ui/PaystackCheckout";

/* ===== TYPES ===== */
interface CartItem {
  product: Product;
  qty: number;
}

/* ===== IMPACT MESSAGES ===== */
function getImpactMessage(total: number): string {
  if (total >= 1500) return "You're changing an entire community!";
  if (total >= 800) return "You're transforming multiple lives!";
  if (total >= 450) return "You're funding a child's full semester!";
  if (total >= 220) return "You're sending a child to school in style!";
  if (total >= 150) return "You're giving a child school supplies!";
  if (total >= 100) return "You're keeping a child healthy!";
  return "Every cedi makes a difference!";
}

export default function ImpactStoreClient() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastReference, setLastReference] = useState("");

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  }, []);

  const updateQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i
        )
        .filter((i) => i.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== id));
  }, []);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/misc/impact-store-hero.jpg"
            alt="Impact Store"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-navy-900/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-navy-900/80" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/10 border border-gold-400/20 px-5 py-2 text-xs font-semibold text-gold-400 uppercase tracking-wider mb-6 backdrop-blur-sm">
              <ShoppingBag className="h-3.5 w-3.5" />
              Shop With Purpose
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Impact Store
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              Every purchase funds a child&apos;s education, healthcare, or
              mentorship. 100% of proceeds go directly to life-changing
              programs.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 px-5 py-2 text-sm text-emerald-400 backdrop-blur-sm">
              <HandHeart className="h-4 w-4" />
              <span className="font-medium">
                100% of every purchase changes a child&apos;s life
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== STORE SECTION ===== */}
      <SectionWrapper background="warm">
        <div className="mx-auto max-w-7xl">
          {/* Category Filter + Cart Toggle */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <div className="flex flex-wrap gap-2">
              {storeCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-navy-900 text-white shadow-lg"
                      : "bg-white text-navy-600 hover:bg-navy-50 shadow"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy-800 shadow-lg"
            >
              <CartIcon className="h-4 w-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-[11px] font-bold text-navy-900 shadow">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Product Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-navy-100/50 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg ${
                          product.badge === "Best Seller"
                            ? "bg-gold-400 text-navy-900"
                            : product.badge === "Most Needed"
                            ? "bg-emerald-500 text-white"
                            : "bg-navy-900 text-gold-400"
                        }`}
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-navy-50 to-white">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Category */}
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                      {product.category}
                    </span>
                    {/* Name */}
                    <h3 className="mt-1 text-base font-bold text-navy-900 leading-tight">
                      {product.name}
                    </h3>
                    {/* Impact */}
                    <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-emerald-50/80 px-3 py-2">
                      <Heart className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                      <p className="text-[11px] leading-relaxed text-emerald-700 font-medium">
                        {product.impact}
                      </p>
                    </div>
                    {/* Description */}
                    <p className="mt-2 text-xs text-navy-500 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                    {/* Price + Button */}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="text-xl font-bold text-navy-900">
                        GH₵{product.price}
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                          addedId === product.id
                            ? "bg-emerald-500 text-white scale-95"
                            : "bg-navy-900 text-white hover:bg-navy-800 hover:scale-105 active:scale-95"
                        }`}
                      >
                        {addedId === product.id ? (
                          <>
                            <Check className="h-3 w-3" />
                            Added!
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </SectionWrapper>

      {/* ===== HOW IT WORKS ===== */}
      <SectionWrapper background="white">
        <SectionHeader
          overline="How It Works"
          title="Every Purchase = Every Impact"
          description="It's simple: you shop, a child thrives. Here's how your purchase transforms into real change."
        />
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: ShoppingBag,
              title: "Choose Your Impact",
              desc: "Browse our curated products. Each item is linked to a specific impact - you'll see exactly how your purchase helps.",
            },
            {
              step: "02",
              icon: HandHeart,
              title: "100% Goes to Children",
              desc: "Every cedi from your purchase directly funds education, healthcare, nutrition, and mentorship for underprivileged children.",
            },
            {
              step: "03",
              icon: Sparkles,
              title: "See the Change",
              desc: "Receive updates on how your purchase made an impact. Real stories, real children, real transformation.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center group"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 transition-transform group-hover:scale-110">
                <item.icon className="h-7 w-7" />
              </div>
              <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-navy-900 mx-auto" style={{ right: "calc(50% - 2.5rem)" }}>
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-navy-900">{item.title}</h3>
              <p className="mt-2 text-sm text-navy-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ===== CTA ===== */}
      <SectionWrapper background="navy">
        <div className="mx-auto max-w-3xl text-center">
          <Heart className="mx-auto h-10 w-10 text-gold-400 mb-4" />
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
            Can&apos;t Shop Right Now?
          </h2>
          <p className="mt-4 text-lg text-white/60">
            You can still make a difference. A direct donation of any amount
            helps us reach more children and change more lives.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/donate"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-8 py-3.5 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
            >
              <Heart className="h-4 w-4" />
              Make a Direct Donation
            </Link>
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Volunteer With Us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </SectionWrapper>

      {/* ===== CART DRAWER ===== */}
      <AnimatePresence>
        {cartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
              onClick={() => setCartOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[100] w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-navy-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                    <CartIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-navy-900">
                      Your Cart
                    </h2>
                    <p className="text-xs text-navy-500">
                      {cartCount} item{cartCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy-600 transition-colors hover:bg-navy-100"
                  aria-label="Close cart"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {paymentSuccess ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-4"
                    >
                      <PartyPopper className="h-10 w-10 text-emerald-600" />
                    </motion.div>
                    <p className="text-lg font-bold text-navy-900">
                      Payment Successful!
                    </p>
                    <p className="mt-2 text-sm text-navy-500">
                      Thank you for your purchase. A receipt has been sent to your email.
                    </p>
                    {lastReference && (
                      <p className="mt-2 text-xs text-navy-400 font-mono">
                        Ref: {lastReference}
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setPaymentSuccess(false);
                        setCartOpen(false);
                      }}
                      className="mt-4 rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy-50 mb-4">
                      <ShoppingBag className="h-8 w-8 text-navy-300" />
                    </div>
                    <p className="text-base font-semibold text-navy-900">
                      Your cart is empty
                    </p>
                    <p className="mt-1 text-sm text-navy-500">
                      Every item you add changes a child&apos;s life
                    </p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="mt-4 rounded-full bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 rounded-xl bg-navy-50/50 p-3 border border-navy-100/50"
                      >
                        {/* Product image */}
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            <h4 className="text-sm font-bold text-navy-900 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">
                              GH₵{item.product.price} each
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            {/* Qty controls */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQty(item.product.id, -1)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-navy-200 text-navy-600 transition-colors hover:bg-navy-100"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-navy-900">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.product.id, 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-navy-200 text-navy-600 transition-colors hover:bg-navy-100"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            {/* Subtotal + remove */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-navy-900">
                                GH₵{item.product.price * item.qty}
                              </span>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer / Checkout */}
              {cart.length > 0 && (
                <div className="border-t border-navy-100 px-6 py-5 space-y-4 bg-white">
                  {/* Impact message */}
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 border border-emerald-100">
                    <HandHeart className="h-5 w-5 text-emerald-600 shrink-0" />
                    <p className="text-xs font-medium text-emerald-700">
                      {getImpactMessage(cartTotal)}
                    </p>
                  </div>

                  {/* Email for receipt */}
                  <div>
                    <label className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-1.5 block">
                      Email for receipt
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      className="w-full rounded-xl border border-navy-200 bg-white py-2.5 px-4 text-sm text-navy-900 placeholder:text-navy-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
                    />
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-navy-600">Subtotal</span>
                    <span className="text-2xl font-bold text-navy-900">
                      GH₵{cartTotal}
                    </span>
                  </div>

                  {/* Paystack Checkout */}
                  <PaystackCheckout
                    amount={cartTotal}
                    email={checkoutEmail}
                    label={`Pay GH₵${cartTotal} Now`}
                    redirectOnSuccess
                    source="store"
                    metadata={{
                      cart_items: cart.map((item) => ({
                        name: item.product.name,
                        id: item.product.id,
                        quantity: item.qty,
                        price: item.product.price,
                      })),
                      source: "impact_store",
                    }}
                  />

                  <p className="text-center text-[10px] text-navy-400">
                    Secure payment via Paystack. Pay with MoMo, Card, or Bank Transfer.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
