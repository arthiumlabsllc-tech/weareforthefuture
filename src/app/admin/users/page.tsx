"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminUsersPage() {
  return (
    <CrudPage
      title="Users & Roles"
      description="Manage admin users and their roles"
      apiBase="/api/admin/users"
      fields={[
        { name: "email", label: "Email", required: true },
        { name: "name", label: "Name" },
        { name: "password", label: "Password (leave blank to keep current)" },
        { name: "role", label: "Role", type: "select", options: [
          { value: "SUPER_ADMIN", label: "Super Admin" },
          { value: "ADMIN", label: "Admin" },
          { value: "EDITOR", label: "Editor" },
          { value: "STORE_MANAGER", label: "Store Manager" },
          { value: "VIEWER", label: "Viewer" },
        ]},
        { name: "suspended", label: "Suspended", type: "checkbox" },
      ]}
      tableColumns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            v === "SUPER_ADMIN" ? "bg-error/10 text-error" :
            v === "ADMIN" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-text"
          }`}>
            {String(v || "").replace("_", " ")}
          </span>
        )},
        { key: "suspended", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-error/10 text-error" : "bg-success/10 text-success-text"}`}>
            {v ? "Suspended" : "Active"}
          </span>
        )},
      ]}
    />
  );
}
