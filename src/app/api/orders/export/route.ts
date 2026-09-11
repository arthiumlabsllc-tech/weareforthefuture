import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/orders/export - CSV export (admin only) */
export async function GET(request: NextRequest) {
  try {
    // Admin auth
    const adminSecret = request.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const fulfillment = searchParams.get("fulfillment") || undefined;

    const where: Record<string, string> = {};
    if (status) where.paymentStatus = status;
    if (fulfillment) where.fulfillmentStatus = fulfillment;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Build CSV
    const headers = [
      "Order ID",
      "Customer Name",
      "Email",
      "Phone",
      "Delivery Method",
      "Region",
      "City",
      "Area",
      "Street Address",
      "Notes",
      "MoMo Provider",
      "MoMo Phone",
      "Items",
      "Subtotal (GHS)",
      "Delivery Fee (GHS)",
      "Total (GHS)",
      "Currency",
      "Payment Status",
      "Payment Reference",
      "Channel",
      "Fulfillment Status",
      "Paid At",
      "Created At",
    ];

    const rows: string[][] = orders.map((o: { orderId: string; customerName: string; email: string; phone: string; deliveryMethod: string; region: string | null; city: string | null; area: string | null; streetAddress: string | null; notes: string | null; momoProvider: string | null; momoPhone: string | null; items: unknown; subtotal: number; deliveryFee: number; total: number; currency: string; paymentStatus: string; paymentReference: string | null; channel: string | null; fulfillmentStatus: string; paidAt: Date | null; createdAt: Date }) => {
      const items = typeof o.items === "string" ? o.items : JSON.stringify(o.items);
      return [
        o.orderId,
        o.customerName,
        o.email,
        o.phone,
        o.deliveryMethod,
        o.region || "",
        o.city || "",
        o.area || "",
        o.streetAddress || "",
        o.notes || "",
        o.momoProvider || "",
        o.momoPhone || "",
        `"${items.replace(/"/g, '""')}"`,
        (o.subtotal / 100).toFixed(2),
        (o.deliveryFee / 100).toFixed(2),
        (o.total / 100).toFixed(2),
        o.currency,
        o.paymentStatus,
        o.paymentReference || "",
        o.channel || "",
        o.fulfillmentStatus,
        o.paidAt ? o.paidAt.toISOString() : "",
        o.createdAt.toISOString(),
      ];
    });

    const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ftf-orders-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("[Orders] Export error:", error);
    return NextResponse.json(
      { error: "Failed to export orders" },
      { status: 500 }
    );
  }
}
