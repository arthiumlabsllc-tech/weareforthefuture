"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, Heart, ShoppingBag } from "lucide-react";

interface Supporter {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  joinDate: string;
  lastLoginAt: string | null;
  donationCount: number;
  orderCount: number;
  totalDonated: number;
}

export default function AdminSupportersPage() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSupporters();
  }, []);

  async function fetchSupporters(query?: string) {
    setLoading(true);
    try {
      const url = query
        ? `/api/admin/supporters?search=${encodeURIComponent(query)}`
        : "/api/admin/supporters";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSupporters(data.supporters);
      }
    } catch (err) {
      console.error("Fetch supporters error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(val: string) {
    setSearch(val);
    fetchSupporters(val);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Supporters</h1>
          <p className="mt-1 text-sm text-text-secondary">
            View all registered supporter accounts and their activity.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Users className="h-4 w-4" />
          {supporters.length} total
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-xl border border-border-strong bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : supporters.length === 0 ? (
        <div className="rounded-2xl bg-surface border border-border p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-text-muted" />
          <p className="text-text-muted">No supporters found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg-primary">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Donations
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Total Donated
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {supporters.map((s) => (
                <tr key={s.id} className="hover:bg-bg-primary/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {s.name}
                      </p>
                      {s.country && (
                        <p className="text-xs text-text-muted">
                          {s.city ? `${s.city}, ` : ""}{s.country}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {s.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {new Date(s.joinDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <Heart className="h-3 w-3 text-rose-500" />
                      {s.donationCount}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-primary">
                    GHS {(s.totalDonated / 100).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                    {s.lastLoginAt
                      ? new Date(s.lastLoginAt).toLocaleDateString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
