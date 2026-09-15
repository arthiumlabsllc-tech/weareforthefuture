"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { img } from "@/lib/imageUrl";
import {
  LayoutDashboard,
  Heart,
  ShoppingBag,
  Bookmark,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/my-account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-account/donations", label: "Donations", icon: Heart },
  { href: "/my-account/orders", label: "Orders", icon: ShoppingBag },
  { href: "/my-account/saved", label: "Saved Items", icon: Bookmark },
  { href: "/my-account/settings", label: "Settings", icon: Settings },
];

export default function SupporterNav({
  supporterName,
}: {
  supporterName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't show sidebar nav on login/register pages
  const isAuthPage =
    pathname === "/supporter-login" || pathname === "/register";

  async function handleLogout() {
    await fetch("/api/supporter/logout", { method: "POST" });
    router.push("/supporter-login");
    router.refresh();
  }

  if (isAuthPage) {
    return (
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src={img("/images/misc/ftf-logo.png")}
              alt="FTF"
              className="h-10 w-auto"
            />
            <span className="text-lg font-bold text-text-primary">
              For The Future
            </span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-surface border border-border p-2 lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-surface transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-border p-6">
            <Link href="/" className="flex items-center gap-2">
              <img
                src={img("/images/misc/ftf-logo.png")}
                alt="FTF"
                className="h-10 w-auto"
              />
              <div>
                <p className="text-sm font-bold text-text-primary">
                  For The Future
                </p>
                <p className="text-xs text-text-muted">My FTF Account</p>
              </div>
            </Link>
          </div>

          {/* Supporter info */}
          {supporterName && (
            <div className="border-b border-border px-6 py-4">
              <p className="text-sm font-medium text-text-primary">
                {supporterName}
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/my-account"
                  ? pathname === "/my-account"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-bg-primary hover:text-text-primary"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-border p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-primary hover:text-error"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
