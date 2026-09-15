"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Bookmark, TrendingUp, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState<{ name: string } | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, donationsRes, ordersRes, savedRes] = await Promise.all([
          fetch("/api/supporter/profile"),
          fetch("/api/supporter/donations"),
          fetch("/api/supporter/orders"),
          fetch("/api/supporter/saved"),
        ]);
        const [profileData, donationsData, ordersData, savedData] = await Promise.all([
          profileRes.ok ? profileRes.json() : { supporter: null },
          donationsRes.ok ? donationsRes.json() : { donations: [] },
          ordersRes.ok ? ordersRes.json() : { orders: [] },
          savedRes.ok ? savedRes.json() : { savedItems: [] },
        ]);
        setProfile(profileData.supporter);
        setDonations(donationsData.donations);
        setOrderCount(ordersData.orders.length);
        setSavedCount(savedData.savedItems.length);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center lg:pl-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalDonated = donations.reduce((sum: number, d: any) => sum + d.amount, 0);

  return (
    <div className="min-h-[60vh] bg-bg-primary lg:pl-64">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Welcome back, {profile?.name?.split(" ")[0] || "Friend"}!
          </h1>
          <p className="mt-1 text-text-secondary">Here&apos;s your impact at a glance.</p>
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/my-account/donations" className="group rounded-2xl bg-surface border border-border p-5 transition-all hover:border-border-strong hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-bg-primary p-2.5 text-rose-500"><Heart className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-medium text-text-muted">Total Donated</p>
                <p className="text-xl font-bold text-text-primary">GHS {(totalDonated / 100).toFixed(2)}</p>
              </div>
            </div>
          </Link>
          <Link href="/my-account/orders" className="group rounded-2xl bg-surface border border-border p-5 transition-all hover:border-border-strong hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-bg-primary p-2.5 text-blue-500"><ShoppingBag className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-medium text-text-muted">Orders</p>
                <p className="text-xl font-bold text-text-primary">{orderCount}</p>
              </div>
            </div>
          </Link>
          <Link href="/my-account/saved" className="group rounded-2xl bg-surface border border-border p-5 transition-all hover:border-border-strong hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-bg-primary p-2.5 text-amber-500"><Bookmark className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-medium text-text-muted">Saved Items</p>
                <p className="text-xl font-bold text-text-primary">{savedCount}</p>
              </div>
            </div>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-surface border border-border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Recent Donations</h2>
            <Link href="/my-account/donations" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {donations.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              No donations yet. <Link href="/donate" className="text-primary hover:underline">Make your first donation</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {donations.slice(0, 5).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl bg-bg-primary px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">GHS {(d.amount / 100).toFixed(2)}</p>
                    <p className="text-xs text-text-muted">{new Date(d.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${d.paymentStatus === "paid" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {d.paymentStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link href="/donate" className="flex items-center gap-3 rounded-xl bg-surface border border-border p-4 text-sm font-medium text-text-secondary transition-all hover:border-primary/30 hover:text-primary">
            <TrendingUp className="h-4 w-4" /> Make a Donation
          </Link>
          <Link href="/my-account/settings" className="flex items-center gap-3 rounded-xl bg-surface border border-border p-4 text-sm font-medium text-text-secondary transition-all hover:border-primary/30 hover:text-primary">
            <Heart className="h-4 w-4" /> Account Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
