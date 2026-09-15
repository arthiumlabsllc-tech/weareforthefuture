"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Order {
  id: string;
  orderId: string;
  total: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/supporter/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Fetch orders error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

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
          <h1 className="text-2xl font-bold text-text-primary">Order History</h1>
          <p className="mt-1 text-sm text-text-secondary">
            View your purchase orders and their status.
          </p>
        </motion.div>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-surface border border-border p-12 text-center">
            <p className="text-text-muted">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-surface border border-border p-6"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      {order.orderId}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.paymentStatus === "paid"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.fulfillmentStatus === "delivered"
                          ? "bg-green-500/10 text-green-600"
                          : order.fulfillmentStatus === "shipped"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-gray-500/10 text-gray-600"
                      }`}
                    >
                      {order.fulfillmentStatus}
                    </span>
                  </div>
                </div>

                <div className="mb-3 space-y-1">
                  {(order.items as { name: string; quantity: number }[]).map(
                    (item, i) => (
                      <p key={i} className="text-sm text-text-secondary">
                        {item.name} &times; {item.quantity}
                      </p>
                    )
                  )}
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-right text-sm font-semibold text-text-primary">
                    Total: {order.currency} {(order.total / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
