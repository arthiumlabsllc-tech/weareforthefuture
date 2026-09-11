"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminImpactStatsPage() {
  return (
    <CrudPage
      title="Impact Stats"
      description="Manage impact statistics shown on home, about, and impact pages"
      apiBase="/api/admin/impact-stats"
      fields={[
        { name: "label", label: "Label", required: true },
        { name: "value", label: "Value", type: "number", required: true },
        { name: "suffix", label: "Suffix (e.g. +, %)" },
        { name: "description", label: "Description" },
        { name: "page", label: "Page", type: "select", options: [
          { value: "home", label: "Homepage" }, { value: "impact", label: "Impact" }, { value: "about", label: "About" },
        ]},
        { name: "order", label: "Order", type: "number" },
      ]}
      tableColumns={[
        { key: "label", label: "Label" },
        { key: "value", label: "Value" },
        { key: "suffix", label: "Suffix" },
        { key: "page", label: "Page" },
      ]}
    />
  );
}
