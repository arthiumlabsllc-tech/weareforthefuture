"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminCampaignsPage() {
  return (
    <CrudPage
      title="FTF Village Campaigns"
      description="Manage FTF Village campaigns and milestones"
      apiBase="/api/admin/campaigns"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "description", label: "Description", type: "textarea", span: 2 },
        { name: "heroImage", label: "Hero Image URL", span: 2 },
        { name: "goalAmount", label: "Goal (pesewas)", type: "number" },
        { name: "raisedAmount", label: "Raised (pesewas)", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      tableColumns={[
        { key: "title", label: "Campaign" },
        { key: "goalAmount", label: "Goal" },
        { key: "raisedAmount", label: "Raised" },
        { key: "published", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent"}`}>
            {v ? "Active" : "Draft"}
          </span>
        )},
      ]}
    />
  );
}
