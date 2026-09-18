"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminDonationsPage() {
  return (
    <CrudPage
      title="Donation Campaigns"
      description="Manage donation campaigns and their goals"
      apiBase="/api/admin/donations"
      fields={[
        { name: "name", label: "Campaign Name", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "description", label: "Description", type: "textarea", span: 2 },
        { name: "heroImage", label: "Hero Image URL", span: 2 },
        { name: "goalAmount", label: "Goal (pesewas)", type: "number" },
        { name: "raisedAmount", label: "Raised (pesewas)", type: "number" },
        { name: "startDate", label: "Start Date" },
        { name: "endDate", label: "End Date" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      tableColumns={[
        { key: "name", label: "Campaign" },
        { key: "goalAmount", label: "Goal" },
        { key: "raisedAmount", label: "Raised" },
        { key: "published", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent-text"}`}>
            {v ? "Active" : "Inactive"}
          </span>
        )},
      ]}
    />
  );
}
