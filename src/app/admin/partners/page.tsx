"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminPartnersPage() {
  return (
    <CrudPage
      title="Partners"
      description="Manage partner organizations"
      apiBase="/api/admin/partners"
      fields={[
        { name: "name", label: "Partner Name", required: true },
        { name: "logo", label: "Logo URL" },
        { name: "website", label: "Website URL" },
        { name: "description", label: "Description", type: "textarea", span: 2 },
        { name: "type", label: "Type", type: "select", options: [
          { value: "Corporate", label: "Corporate" }, { value: "NGO", label: "NGO" },
          { value: "Government", label: "Government" }, { value: "Individual", label: "Individual" },
        ]},
        { name: "tier", label: "Tier", type: "select", options: [
          { value: "Platinum", label: "Platinum" }, { value: "Gold", label: "Gold" },
          { value: "Silver", label: "Silver" }, { value: "Bronze", label: "Bronze" },
        ]},
        { name: "order", label: "Order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      tableColumns={[
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
        { key: "tier", label: "Tier" },
        { key: "published", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent-text"}`}>
            {v ? "Published" : "Draft"}
          </span>
        )},
      ]}
    />
  );
}
