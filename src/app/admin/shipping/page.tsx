"use client";
import CrudPage from "@/components/admin/CrudPage";

export default function AdminShippingPage() {
  return (
    <CrudPage
      title="Shipping Zones"
      description="Manage shipping regions, fees, and pickup options"
      apiBase="/api/admin/shipping"
      fields={[
        { name: "region", label: "Region", required: true },
        { name: "fee", label: "Fee (pesewas)", type: "number", required: true },
        { name: "freeThreshold", label: "Free Delivery Above (pesewas)", type: "number" },
        { name: "heavySurcharge", label: "Heavy Surcharge (pesewas)", type: "number" },
        { name: "pickupEnabled", label: "Pickup Enabled", type: "checkbox" },
        { name: "pickupAddress", label: "Pickup Address", span: 2 },
      ]}
      tableColumns={[
        { key: "region", label: "Region" },
        { key: "fee", label: "Fee", render: (v) => `GHS ${(Number(v) / 100).toFixed(2)}` },
        { key: "pickupEnabled", label: "Pickup", render: (v) => v ? "Yes" : "No" },
      ]}
    />
  );
}
