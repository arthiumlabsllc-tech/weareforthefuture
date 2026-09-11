"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  LogOut,
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface Order {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryMethod: string;
  region: string | null;
  city: string | null;
  area: string | null;
  streetAddress: string | null;
  notes: string | null;
  momoProvider: string | null;
  momoPhone: string | null;
  items: Array<{ productId: string; name: string; price: number; quantity: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentStatus: string;
  paymentReference: string | null;
  channel: string | null;
  fulfillmentStatus: string;
  paidAt: string | null;
  createdAt: string;
}

const FULFILLMENT_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-700" },
  { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-700" },
  { value: "delivered", label: "Delivered", color: "bg-success-bg text-success-text" },
  { value: "picked_up", label: "Picked Up", color: "bg-green-100 text-green-700" },
];

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-success-bg text-success-text",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function AdminOrdersClient() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [adminSecret, setAdminSecret] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Check sessionStorage for existing auth
  useEffect(() => {
    const stored = sessionStorage.getItem("ftf-admin-secret");
    if (stored) {
      setAdminSecret(stored);
      setAuthed(true);
    }
  }, []);

  // Fetch orders when authed or filters change
  const fetchOrders = useCallback(async () => {
    if (!adminSecret) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (fulfillmentFilter) params.set("fulfillment", fulfillmentFilter);

      const res = await fetch(`/api/orders?${params}`, {
        headers: { "x-admin-secret": adminSecret },
      });

      if (res.status === 401) {
        setAuthed(false);
        sessionStorage.removeItem("ftf-admin-secret");
        return;
      }

      const data = await res.json();
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [adminSecret, page, statusFilter, fulfillmentFilter]);

  useEffect(() => {
    if (authed) fetchOrders();
  }, [authed, fetchOrders]);

  const handleLogin = () => {
    if (!password.trim()) {
      setAuthError("Please enter the admin password");
      return;
    }
    setAdminSecret(password.trim());
    sessionStorage.setItem("ftf-admin-secret", password.trim());
    setAuthed(true);
    setAuthError("");
  };

  const handleLogout = () => {
    setAuthed(false);
    setAdminSecret("");
    setPassword("");
    sessionStorage.removeItem("ftf-admin-secret");
  };

  const handleUpdateFulfillment = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ fulfillmentStatus: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderId ? { ...o, fulfillmentStatus: newStatus } : o
          )
        );
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, fulfillmentStatus: newStatus } : null);
        }
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (fulfillmentFilter) params.set("fulfillment", fulfillmentFilter);

      const res = await fetch(`/api/orders/export?${params}`, {
        headers: { "x-admin-secret": adminSecret },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ftf-orders-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  // Password Gate
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl bg-surface p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-accent">
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-text-primary">Admin Access</h1>
              <p className="text-sm text-text-secondary mt-1">Enter the admin password to continue</p>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Admin password"
              className="w-full rounded-xl border border-border-strong bg-surface py-3 px-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 mb-3"
              autoFocus
            />
            {authError && <p className="text-sm text-red-500 mb-3">{authError}</p>}
            <button
              onClick={handleLogin}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-text-on-primary hover:bg-primary-hover transition-colors"
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 pt-28 pb-16 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Order Management</h1>
            <p className="text-sm text-text-secondary">{totalCount} total orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs font-medium text-text-tertiary hover:bg-bg-tertiary"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-text-on-primary hover:bg-primary-hover"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-surface px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs text-text-secondary focus:border-accent focus:outline-none"
          >
            <option value="">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={fulfillmentFilter}
            onChange={(e) => { setFulfillmentFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs text-text-secondary focus:border-accent focus:outline-none"
          >
            <option value="">All Fulfillment</option>
            {FULFILLMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-tertiary/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Fulfillment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-text-muted mx-auto" />
                      <p className="text-sm text-text-secondary mt-2">Loading orders...</p>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Package className="h-8 w-8 text-text-muted mx-auto mb-2" />
                      <p className="text-sm text-text-secondary">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-divider hover:bg-bg-tertiary/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono font-semibold text-text-primary">{order.orderId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-text-primary">{order.customerName}</p>
                        <p className="text-xs text-text-secondary">{order.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-text-primary">GH₵{(order.total / 100).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_STYLES[order.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                          {order.paymentStatus === "paid" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {order.paymentStatus === "failed" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {order.paymentStatus === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.fulfillmentStatus}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleUpdateFulfillment(order.orderId, e.target.value);
                          }}
                          disabled={updatingId === order.orderId}
                          className="rounded-lg border border-border-strong bg-surface px-2 py-1 text-xs text-text-secondary focus:border-accent focus:outline-none disabled:opacity-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {FULFILLMENT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-text-secondary">
                          {new Date(order.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                          className="inline-flex items-center gap-1 rounded-lg border border-border-strong px-2 py-1 text-xs text-text-tertiary hover:bg-bg-tertiary"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-text-secondary">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-border-strong px-3 py-1.5 text-xs text-text-tertiary hover:bg-bg-tertiary disabled:opacity-50"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-border-strong px-3 py-1.5 text-xs text-text-tertiary hover:bg-bg-tertiary disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
                onClick={() => setSelectedOrder(null)}
              />
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 z-[100] w-full max-w-lg bg-surface shadow-2xl overflow-y-auto"
              >
                <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">{selectedOrder.orderId}</h2>
                    <p className="text-xs text-text-secondary">{selectedOrder.customerName}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-tertiary text-text-tertiary hover:bg-border"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status badges */}
                  <div className="flex gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${PAYMENT_STATUS_STYLES[selectedOrder.paymentStatus] || "bg-gray-100 text-gray-700"}`}>
                      Payment: {selectedOrder.paymentStatus}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${FULFILLMENT_OPTIONS.find((o) => o.value === selectedOrder.fulfillmentStatus)?.color || "bg-gray-100 text-gray-700"}`}>
                      Fulfillment: {selectedOrder.fulfillmentStatus}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="rounded-xl bg-bg-tertiary p-4 space-y-2">
                    <h3 className="text-sm font-bold text-text-primary">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-text-secondary">Name:</span> <span className="text-text-primary font-medium">{selectedOrder.customerName}</span></div>
                      <div><span className="text-text-secondary">Email:</span> <span className="text-text-primary">{selectedOrder.email}</span></div>
                      <div><span className="text-text-secondary">Phone:</span> <span className="text-text-primary">{selectedOrder.phone}</span></div>
                      <div><span className="text-text-secondary">MoMo:</span> <span className="text-text-primary">{selectedOrder.momoProvider?.toUpperCase()} {selectedOrder.momoPhone}</span></div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="rounded-xl bg-bg-tertiary p-4 space-y-2">
                    <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery
                    </h3>
                    <p className="text-sm text-text-primary">
                      {selectedOrder.deliveryMethod === "home_delivery" ? (
                        <>
                          {selectedOrder.streetAddress}, {selectedOrder.area && `${selectedOrder.area}, `}{selectedOrder.city}, {selectedOrder.region}
                        </>
                      ) : (
                        "Pickup at FTF Office"
                      )}
                    </p>
                    {selectedOrder.notes && (
                      <p className="text-xs text-text-secondary italic">Note: {selectedOrder.notes}</p>
                    )}
                  </div>

                  {/* Items */}
                  <div className="rounded-xl bg-bg-tertiary p-4 space-y-2">
                    <h3 className="text-sm font-bold text-text-primary">Items</h3>
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-text-secondary">{item.name} x{item.quantity}</span>
                        <span className="text-text-primary font-medium">GH₵{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border-strong pt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Subtotal</span>
                        <span className="text-text-primary">GH₵{(selectedOrder.subtotal / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Delivery</span>
                        <span className="text-text-primary">{selectedOrder.deliveryFee === 0 ? "FREE" : `GH₵${(selectedOrder.deliveryFee / 100).toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span className="text-text-primary">Total</span>
                        <span className="text-text-primary">GH₵{(selectedOrder.total / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="rounded-xl bg-bg-tertiary p-4 space-y-2">
                    <h3 className="text-sm font-bold text-text-primary">Payment Details</h3>
                    <div className="text-sm space-y-1">
                      {selectedOrder.paymentReference && (
                        <p><span className="text-text-secondary">Reference:</span> <span className="font-mono text-text-primary">{selectedOrder.paymentReference}</span></p>
                      )}
                      {selectedOrder.channel && (
                        <p><span className="text-text-secondary">Channel:</span> <span className="text-text-primary capitalize">{selectedOrder.channel.replace("_", " ")}</span></p>
                      )}
                      {selectedOrder.paidAt && (
                        <p><span className="text-text-secondary">Paid at:</span> <span className="text-text-primary">{new Date(selectedOrder.paidAt).toLocaleString()}</span></p>
                      )}
                      <p><span className="text-text-secondary">Created:</span> <span className="text-text-primary">{new Date(selectedOrder.createdAt).toLocaleString()}</span></p>
                    </div>
                  </div>

                  {/* Update fulfillment */}
                  <div>
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">
                      Update Fulfillment Status
                    </label>
                    <select
                      value={selectedOrder.fulfillmentStatus}
                      onChange={(e) => handleUpdateFulfillment(selectedOrder.orderId, e.target.value)}
                      className="w-full rounded-xl border border-border-strong bg-surface py-3 px-4 text-sm text-text-primary focus:border-accent focus:outline-none"
                    >
                      {FULFILLMENT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
