import type { Role } from "@prisma/client";
import type { AdminSession } from "./admin-auth";

// ============================================
// ROLE PERMISSIONS
// ============================================

type Permission =
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
  | "audit.view";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "dashboard.view", "blog.manage", "stories.manage", "team.manage",
    "boards.manage", "partners.manage", "faq.manage", "documents.manage",
    "programs.manage", "pages.edit", "products.manage", "orders.manage",
    "shipping.manage", "donations.view", "campaigns.manage", "messages.manage",
    "newsletter.manage", "users.manage", "settings.manage", "audit.view",
  ],
  ADMIN: [
    "dashboard.view", "blog.manage", "stories.manage", "team.manage",
    "boards.manage", "partners.manage", "faq.manage", "documents.manage",
    "programs.manage", "pages.edit", "products.manage", "orders.manage",
    "shipping.manage", "donations.view", "campaigns.manage", "messages.manage",
    "newsletter.manage", "audit.view",
  ],
  EDITOR: [
    "dashboard.view", "blog.manage", "stories.manage",
  ],
  STORE_MANAGER: [
    "dashboard.view", "products.manage", "orders.manage", "shipping.manage",
  ],
  VIEWER: [
    "dashboard.view",
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
  "/admin/messages": "messages.manage",
  "/admin/volunteers": "messages.manage",
  "/admin/newsletter": "newsletter.manage",
  "/admin/users": "users.manage",
  "/admin/settings": "settings.manage",
  "/admin/activity": "audit.view",
};
