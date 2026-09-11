"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminTestimonialsPage() {
  return (
    <CrudPage
      title="Testimonials"
      description="Manage testimonials and quotes"
      apiBase="/api/admin/testimonials"
      fields={[
        { name: "quote", label: "Quote", type: "textarea", required: true, span: 2 },
        { name: "author", label: "Author", required: true },
        { name: "role", label: "Role / Title" },
        { name: "image", label: "Image URL" },
        { name: "order", label: "Order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      tableColumns={[
        { key: "quote", label: "Quote", render: (v) => String(v || "").slice(0, 60) + "..." },
        { key: "author", label: "Author" },
        { key: "role", label: "Role" },
        { key: "published", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent"}`}>
            {v ? "Published" : "Hidden"}
          </span>
        )},
      ]}
    />
  );
}
