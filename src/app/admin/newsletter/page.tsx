"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminNewsletterPage() {
  return (
    <CrudPage
      title="Newsletter Subscribers"
      description="Manage newsletter subscriptions"
      apiBase="/api/admin/newsletter"
      fields={[
        { name: "email", label: "Email", required: true },
        { name: "name", label: "Name" },
        { name: "source", label: "Source" },
        { name: "active", label: "Active", type: "checkbox" },
      ]}
      tableColumns={[
        { key: "email", label: "Email" },
        { key: "name", label: "Name" },
        { key: "source", label: "Source" },
        { key: "active", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent-text"}`}>
            {v ? "Active" : "Inactive"}
          </span>
        )},
      ]}
    />
  );
}
