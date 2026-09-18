import { prisma } from "@/lib/db";
import {
  DollarSign,
  ShoppingBag,
  MessageSquare,
  Mail,
  TrendingUp,
  Package,
  Heart,
  FileText,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch stats in parallel
  const [
    orderCount,
    totalRevenue,
    pendingOrders,
    contactSubmissions,
    newsletterCount,
    blogPostCount,
    productCount,
    donationCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
    prisma.order.count({ where: { fulfillmentStatus: "pending" } }),
    prisma.contactSubmission.count({ where: { status: "unread" } }),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.blogPost.count(),
    prisma.product.count({ where: { status: "active" } }),
    prisma.donation.count({ where: { paymentStatus: "paid" } }),
  ]);

  const revenueGhs = (totalRevenue._sum.total || 0) / 100;

  const stats = [
    {
      label: "Total Revenue",
      value: `GH₵${revenueGhs.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-success/10 text-success-text",
    },
    {
      label: "Total Orders",
      value: orderCount.toString(),
      icon: ShoppingBag,
      color: "bg-accent/10 text-accent-text",
    },
    {
      label: "Pending Orders",
      value: pendingOrders.toString(),
      icon: Package,
      color: "bg-error/10 text-error",
    },
    {
      label: "Unread Messages",
      value: contactSubmissions.toString(),
      icon: MessageSquare,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Newsletter Subs",
      value: newsletterCount.toString(),
      icon: Mail,
      color: "bg-success/10 text-success-text",
    },
    {
      label: "Blog Posts",
      value: blogPostCount.toString(),
      icon: FileText,
      color: "bg-accent/10 text-accent-text",
    },
    {
      label: "Active Products",
      value: productCount.toString(),
      icon: ShoppingBag,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Donations",
      value: donationCount.toString(),
      icon: Heart,
      color: "bg-error/10 text-error",
    },
  ];

  const quickActions = [
    { label: "New Blog Post", href: "/admin/blog/new", icon: FileText },
    { label: "Add Product", href: "/admin/products/new", icon: ShoppingBag },
    { label: "View Orders", href: "/admin/orders", icon: Package },
    { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-text-primary">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Overview of your organization&apos;s activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl bg-surface border border-border p-5"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-success-text" />
              </div>
              <p className="mt-3 text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-secondary">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-xl bg-surface border border-border p-4 transition-all hover:border-accent hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent-text">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-text-primary">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-xl bg-surface border border-border p-6">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Recent Activity</h2>
        <p className="text-sm text-text-secondary">
          Activity feed will appear here as actions are performed.
        </p>
      </div>
    </div>
  );
}
