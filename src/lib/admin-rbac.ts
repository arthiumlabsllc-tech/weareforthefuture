import type { Role } from "@prisma/client";
import type { AdminSession } from "./admin-auth";

// ============================================
// ROLE PERMISSIONS
// ============================================

export type Permission =
  | "dashboard.view"
  | "blog.manage"
  | "stories.manage"
  | "team.manage"
  | "boards.manage"
  | "partners.manage"
  | "faq.manage"
  | "documents.manage"
  | "programs.manage"
  | "pages.edit"
  | "products.manage"
  | "orders.manage"
  | "shipping.manage"
  | "donations.view"
  | "campaigns.manage"
  | "messages.manage"
  | "newsletter.manage"
  | "users.manage"
  | "settings.manage"
  | "audit.view"
  | "cases.view"
  | "cases.edit"
  | "cases.review"
  | "cases.publish"
  | "refunds.view"
  | "refunds.manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "dashboard.view", "blog.manage", "stories.manage", "team.manage",
    "boards.manage", "partners.manage", "faq.manage", "documents.manage",
    "programs.manage", "pages.edit", "products.manage", "orders.manage",
    "shipping.manage", "donations.view", "campaigns.manage", "messages.manage",
    "newsletter.manage", "users.manage", "settings.manage", "audit.view",
    "cases.view", "cases.edit", "cases.review", "cases.publish", "refunds.view", "refunds.manage",
  ],
  ADMIN: [
    "dashboard.view", "blog.manage", "stories.manage", "team.manage",
    "boards.manage", "partners.manage", "faq.manage", "documents.manage",
    "programs.manage", "pages.edit", "products.manage", "orders.manage",
    "shipping.manage", "donations.view", "campaigns.manage", "messages.manage",
    "newsletter.manage", "audit.view",
    "cases.view", "cases.edit", "cases.publish", "refunds.view", "refunds.manage",
  ],
  EDITOR: [
    "dashboard.view", "blog.manage", "stories.manage", "cases.view", "cases.edit",
  ],
  STORE_MANAGER: [
    "dashboard.view", "products.manage", "orders.manage", "shipping.manage",
  ],
  VIEWER: [
    "dashboard.view",
  ],
  SAFEGUARDING_OFFICER: [
    "cases.view", "cases.review",
  ],
};

export function hasPermission(session: AdminSession, permission: Permission): boolean {
  return ROLE_PERMISSIONS[session.role]?.includes(permission) ?? false;
}

export function requirePermission(session: AdminSession, permission: Permission): void {
  if (!hasPermission(session, permission)) {
    throw new Error("Unauthorized: insufficient permissions");
  }
}

// Route-to-permission mapping for middleware
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/admin/dashboard": "dashboard.view",
  "/admin/blog": "blog.manage",
  "/admin/stories": "stories.manage",
  "/admin/team": "team.manage",
  "/admin/executive-board": "boards.manage",
  "/admin/advisory-board": "boards.manage",
  "/admin/partners": "partners.manage",
  "/admin/faq": "faq.manage",
  "/admin/documents": "documents.manage",
  "/admin/programs": "programs.manage",
  "/admin/pages": "pages.edit",
  "/admin/products": "products.manage",
  "/admin/orders": "orders.manage",
  "/admin/shipping": "shipping.manage",
  "/admin/donations": "donations.view",
  "/admin/campaigns": "campaigns.manage",
  "/admin/beneficiary-cases": "cases.view",
  "/admin/beneficiary-cases/new": "cases.edit",
  "/admin/refunds": "refunds.view",
  "/admin/messages": "messages.manage",
  "/admin/volunteers": "messages.manage",
  "/admin/newsletter": "newsletter.manage",
  "/admin/users": "users.manage",
  "/admin/settings": "settings.manage",
  "/admin/activity": "audit.view",
  "/admin/supporters": "donations.view",
  "/admin/impact-stats": "pages.edit",
  "/admin/testimonials": "pages.edit",
};

export function adminRoutePermission(pathname: string): Permission | null {
  const route = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length)
    .find((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return route ? ROUTE_PERMISSIONS[route] : null;
}

export function adminHome(role: string) {
  return role === "SAFEGUARDING_OFFICER" ? "/admin/beneficiary-cases" : "/admin/dashboard";
}
