"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminProductsPage() {
  return (
    <CrudPage
      title="Products"
      description="Manage Impact Store products"
      apiBase="/api/admin/products"
      fields={[
        { name: "name", label: "Product Name", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "shortDescription", label: "Short Description", span: 2 },
        { name: "description", label: "Description (HTML)", type: "textarea", span: 2 },
        { name: "impactStatement", label: "Impact Statement", span: 2 },
        { name: "price", label: "Price (pesewas)", type: "number", required: true },
        { name: "compareAtPrice", label: "Compare At Price (pesewas)", type: "number" },
        { name: "sku", label: "SKU" },
        { name: "stock", label: "Stock", type: "number" },
        { name: "weight", label: "Weight (kg)", type: "number" },
        { name: "badge", label: "Badge", type: "select", options: [
          { value: "", label: "None" }, { value: "Best Seller", label: "Best Seller" },
          { value: "Most Needed", label: "Most Needed" }, { value: "Premium", label: "Premium" },
        ]},
        { name: "status", label: "Status", type: "select", options: [
          { value: "draft", label: "Draft" }, { value: "active", label: "Active" },
          { value: "out_of_stock", label: "Out of Stock" }, { value: "archived", label: "Archived" },
        ]},
      ]}
      tableColumns={[
        { key: "name", label: "Product" },
        { key: "price", label: "Price", render: (v) => `GHS ${(Number(v) / 100).toFixed(2)}` },
        { key: "stock", label: "Stock" },
        { key: "status", label: "Status", render: (v) => (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            v === "active" ? "bg-success/10 text-success-text" :
            v === "out_of_stock" ? "bg-error/10 text-error" : "bg-accent/10 text-accent"
          }`}>
            {String(v || "draft")}
          </span>
        )},
      ]}
    />
  );
}
