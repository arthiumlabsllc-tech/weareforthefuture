"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { CaseAllocation } from "@/lib/support-a-future/domain";

interface Donation {
  id: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  anonymous: boolean;
  createdAt: string;
  campaign: { name: string; slug: string } | null;
  caseAllocation: CaseAllocation | null;
  retainedGivingAmount: number | null;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchDonations() {
      try {
        const res = await fetch("/api/supporter/donations", { cache: "no-store" });
        if (!res.ok) throw new Error("History unavailable");
        const data = await res.json();
        setDonations(data.donations);
      } catch {
        setError(true);
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
            Original payments are shown separately from retained giving. Completed refunds, pending payments, and held excess are excluded from retained giving. Gifts awaiting reconciliation have no confirmed current balance.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["all", "paid", "pending", "refunded"].map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`min-h-11 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
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
        {error ? <p role="status" className="rounded-2xl border border-border bg-surface p-6 text-warning-text">Donation history is unavailable. Reload this page to try again.</p> : filtered.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-12 text-center">
            <p className="text-text-muted">No donations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-surface border border-border" role="region" aria-label="Donation history table" tabIndex={0}>
            <table className="w-full">
              <caption className="sr-only">Original payments, retained giving, designations, and payment status</caption>
              <thead>
                <tr className="border-b border-border bg-bg-primary">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Original amount / retained giving
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Designation
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
                      <p className="tabular-nums">{d.currency} {(d.amount / 100).toFixed(2)} original</p>
                      <p className="mt-1 text-xs font-normal text-text-secondary">{d.retainedGivingAmount === null ? "Awaiting reconciliation" : `${d.currency} ${(d.retainedGivingAmount / 100).toFixed(2)} retained giving`}</p>
                      {d.caseAllocation && <p className="mt-1 text-xs font-normal text-text-secondary">
                        {d.currency} {(d.caseAllocation.refundedAmount / 100).toFixed(2)} refunded · {d.currency} {(d.caseAllocation.heldAmount / 100).toFixed(2)} held
                      </p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {d.caseAllocation ? "Support a Future" : d.campaign?.name || "General"}
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
