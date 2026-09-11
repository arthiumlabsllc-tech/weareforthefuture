"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Users,
  Shield,
  ShieldCheck,
  Handshake,
  HelpCircle,
  FileCheck,
  GraduationCap,
  BarChart3,
  Quote,
  ShoppingBag,
  Package,
  Truck,
  Heart,
  Target,
  MessageSquare,
  Mail,
  UserCog,
  Settings,
  Activity,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import type { AdminSession } from "@/lib/admin-auth";
import { img } from "@/lib/imageUrl";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Blog / News", href: "/admin/blog", icon: FileText },
      { label: "Impact Stories", href: "/admin/stories", icon: BookOpen },
      { label: "Programs", href: "/admin/programs", icon: GraduationCap },
      { label: "Team", href: "/admin/team", icon: Users },
      { label: "Executive Board", href: "/admin/executive-board", icon: Shield },
      { label: "Advisory Board", href: "/admin/advisory-board", icon: ShieldCheck },
      { label: "Partners", href: "/admin/partners", icon: Handshake },
      { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
      { label: "Documents", href: "/admin/documents", icon: FileCheck },
      { label: "Impact Stats", href: "/admin/impact-stats", icon: BarChart3 },
      { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
    ],
  },
  {
    title: "Store",
    items: [
      { label: "Products", href: "/admin/products", icon: ShoppingBag },
      { label: "Orders", href: "/admin/orders", icon: Package },
      { label: "Shipping", href: "/admin/shipping", icon: Truck },
    ],
  },
  {
    title: "Donations",
    items: [
      { label: "Donations", href: "/admin/donations", icon: Heart },
      { label: "Campaigns", href: "/admin/campaigns", icon: Target },
    ],
  },
  {
    title: "Messages",
    items: [
      { label: "Inbox", href: "/admin/messages", icon: MessageSquare },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Users", href: "/admin/users", icon: UserCog },
      { label: "Settings", href: "/admin/settings", icon: Settings },
      { label: "Activity Log", href: "/admin/activity", icon: Activity },
    ],
  },
];

export default function AdminSidebar({ session }: { session: AdminSession }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(NAV_SECTIONS.map((s) => s.title))
  );

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function toggleSection(title: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-border px-4">
        <img
          src={img("/images/misc/ftf-logo.png")}
          alt="FTF Logo"
          className="h-14 w-14 rounded-lg object-contain"
        />
        <div>
          <p className="text-sm font-bold text-text-primary">FTF Admin</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">{session.role.replace("_", " ")}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="flex w-full items-center justify-between px-2 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider hover:text-text-secondary"
            >
              {section.title}
              <ChevronDown
                className={`h-3 w-3 transition-transform ${
                  expandedSections.has(section.title) ? "" : "-rotate-90"
                }`}
              />
            </button>
            {expandedSections.has(section.title) && (
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-text-on-primary"
                          : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-error/10 hover:text-error"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-text-on-primary shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transition-transform lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-4 text-text-muted hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-surface border-r border-border lg:block">
        {sidebarContent}
      </aside>
    </>
  );
}
