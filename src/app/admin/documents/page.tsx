"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminDocumentsPage() {
  return (
    <CrudPage
      title="Documents"
      description="Manage downloadable documents and reports"
      apiBase="/api/admin/documents"
      fields={[
        { name: "title", label: "Title", required: true, span: 2 },
        { name: "description", label: "Description", type: "textarea", span: 2 },
        { name: "fileUrl", label: "File URL (PDF)", required: true, span: 2 },
        { name: "category", label: "Category", type: "select", options: [
          { value: "Annual Report", label: "Annual Report" }, { value: "Financial", label: "Financial" },
          { value: "Impact Report", label: "Impact Report" }, { value: "990", label: "990 / Tax Filing" },
        ]},
        { name: "year", label: "Year", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      tableColumns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "year", label: "Year" },
        { key: "published", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent"}`}>
            {v ? "Published" : "Draft"}
          </span>
        )},
      ]}
    />
  );
}
