"use client";
import { useState, useEffect } from "react";
import { Package, Eye, Truck, CheckCircle, Clock } from "lucide-react";

interface Order {
  id: string; orderId: string; customerName: string; email: string; phone: string;
  total: number; currency: string; paymentStatus: string; fulfillmentStatus: string;
  deliveryMethod: string; channel: string; createdAt: string; items: unknown[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  async function load() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, fulfillmentStatus: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfillmentStatus }),
    });
    load();
    setSelected(null);
  }

  if (loading) return <div className="p-8 text-text-secondary">Loading orders...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Package className="h-6 w-6" /> Orders
        </h1>
        <p className="mt-1 text-sm text-text-secondary">{orders.length} total orders</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Order ID</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Total</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Payment</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Fulfillment</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Date</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-bg-secondary/50">
                <td className="px-4 py-3 font-mono text-xs">{o.orderId}</td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3">GHS {(o.total / 100).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    o.paymentStatus === "paid" ? "bg-success/10 text-success-text" : "bg-warning/10 text-warning-text"
                  }`}>{o.paymentStatus}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    o.fulfillmentStatus === "delivered" ? "bg-success/10 text-success-text" :
                    o.fulfillmentStatus === "processing" ? "bg-info/10 text-info-text" : "bg-accent/10 text-accent-text"
                  }`}>{o.fulfillmentStatus}</span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelected(o)} className="text-accent-text hover:underline text-xs">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-text-muted">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-text-primary mb-4">Order {selected.orderId}</h2>
            <div className="space-y-2 text-sm mb-6">
              <p><span className="text-text-secondary">Customer:</span> {selected.customerName}</p>
              <p><span className="text-text-secondary">Email:</span> {selected.email}</p>
              <p><span className="text-text-secondary">Phone:</span> {selected.phone}</p>
              <p><span className="text-text-secondary">Total:</span> GHS {(selected.total / 100).toFixed(2)}</p>
              <p><span className="text-text-secondary">Delivery:</span> {selected.deliveryMethod}</p>
            </div>
            <div className="flex gap-2">
              {["pending", "processing", "shipped", "delivered", "picked_up"].map((s) => (
                <button key={s} onClick={() => updateStatus(selected.id, s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected.fulfillmentStatus === s
                      ? "bg-primary text-text-on-primary" : "bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
                  }`}>
                  {s === "pending" && <Clock className="inline h-3 w-3 mr-1" />}
                  {s === "processing" && <Truck className="inline h-3 w-3 mr-1" />}
                  {s === "delivered" && <CheckCircle className="inline h-3 w-3 mr-1" />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
