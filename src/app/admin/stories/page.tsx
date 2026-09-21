"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminStoriesPage() {
  return (
    <CrudPage
      title="Impact Stories"
      description="Manage impact stories and beneficiary narratives"
      apiBase="/api/admin/stories"
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "excerpt", label: "Excerpt", type: "textarea", span: 2 },
        { name: "content", label: "Content (HTML)", type: "textarea", span: 2 },
        { name: "featuredImage", label: "Featured Image URL", span: 2 },
        { name: "gallery", label: "Gallery (JSON: [{ \"url\", \"alt\", \"caption?\" }])", type: "json", span: 2 },
        { name: "childName", label: "Child's First Name" },
        { name: "program", label: "Linked Program" },
        { name: "location", label: "Location" },
        { name: "pullQuote", label: "Pull Quote", type: "textarea", span: 2 },
        { name: "consentGiven", label: "Consent Given (required to publish publicly)", type: "checkbox" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      tableColumns={[
        { key: "title", label: "Title" },
        { key: "program", label: "Program" },
        { key: "location", label: "Location" },
        { key: "published", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-success/10 text-success-text" : "bg-accent/10 text-accent-text"}`}>
            {v ? "Published" : "Draft"}
          </span>
        )},
        { key: "consentGiven", label: "Consent", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${v ? "bg-success/10 text-success-text" : "bg-error/10 text-error"}`}>
            {v ? "Given" : "Missing"}
          </span>
        )},
      ]}
    />
  );
}
