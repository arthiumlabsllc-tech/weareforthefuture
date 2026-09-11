"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminProgramsPage() {
  return (
    <CrudPage
      title="Programs"
      description="Manage organization programs and initiatives"
      apiBase="/api/admin/programs"
      fields={[
        { name: "name", label: "Program Name", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "shortDescription", label: "Short Description", type: "textarea", span: 2 },
        { name: "description", label: "Full Description (HTML)", type: "textarea", span: 2 },
        { name: "icon", label: "Icon (emoji or URL)" },
        { name: "image", label: "Image URL" },
        { name: "order", label: "Order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      tableColumns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "published", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent"}`}>
            {v ? "Published" : "Draft"}
          </span>
        )},
      ]}
    />
  );
}
