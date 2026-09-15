"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Donation {
  id: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  anonymous: boolean;
  createdAt: string;
  campaign: { name: string; slug: string } | null;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchDonations() {
      try {
        const res = await fetch("/api/supporter/donations");
        if (res.ok) {
          const data = await res.json();
          setDonations(data.donations);
        }
      } catch (err) {
        console.error("Fetch donations error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDonations();
  }, []);

  const filtered =
    filter === "all"
      ? donations
      : donations.filter((d) => d.paymentStatus === filter);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center lg:pl-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-bg-primary lg:pl-64">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-text-primary">
            Donation History
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track all your contributions to For The Future.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {["all", "paid", "pending"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-text-on-primary"
                  : "bg-surface text-text-secondary border border-border hover:bg-bg-primary"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-12 text-center">
            <p className="text-text-muted">No donations found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-surface border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-primary">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-bg-primary/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-primary">
                      {d.currency} {(d.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {d.campaign?.name || "General"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          d.paymentStatus === "paid"
                            ? "bg-green-500/10 text-green-600"
                            : d.paymentStatus === "pending"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {d.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
