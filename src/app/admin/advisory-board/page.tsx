"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminAdvisoryBoardPage() {
  return (
    <CrudPage
      title="Advisory Board"
      description="Manage advisory board members"
      apiBase="/api/admin/advisory-board"
      fields={[
        { name: "name", label: "Full Name", required: true },
        { name: "role", label: "Role / Title", required: true },
        { name: "bio", label: "Bio", type: "textarea", span: 2 },
        { name: "image", label: "Image URL" },
        { name: "country", label: "Country" },
        { name: "email", label: "Email" },
        { name: "linkedin", label: "LinkedIn URL" },
        { name: "twitter", label: "Twitter URL" },
        { name: "committee", label: "Committee" },
        { name: "order", label: "Order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      tableColumns={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "country", label: "Country" },
        { key: "published", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent-text"}`}>
            {v ? "Published" : "Draft"}
          </span>
        )},
      ]}
    />
  );
}
