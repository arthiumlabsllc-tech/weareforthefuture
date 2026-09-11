"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminFaqPage() {
  return (
    <CrudPage
      title="FAQ"
      description="Manage frequently asked questions"
      apiBase="/api/admin/faq"
      fields={[
        { name: "question", label: "Question", required: true, span: 2 },
        { name: "answer", label: "Answer", type: "textarea", required: true, span: 2 },
        { name: "category", label: "Category", type: "select", options: [
          { value: "General", label: "General" }, { value: "Donations", label: "Donations" },
          { value: "Store", label: "Store" }, { value: "Programs", label: "Programs" },
        ]},
        { name: "order", label: "Order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      tableColumns={[
        { key: "question", label: "Question" },
        { key: "category", label: "Category" },
        { key: "published", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent"}`}>
            {v ? "Published" : "Draft"}
          </span>
        )},
      ]}
    />
  );
}
