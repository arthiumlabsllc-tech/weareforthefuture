import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/orders/[id] - Get single order */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if it's an admin request or a customer lookup
    const adminSecret = request.headers.get("x-admin-secret");
    const isAdmin = adminSecret === process.env.ADMIN_SECRET;

    if (isAdmin) {
      // Admin can look up by order ID directly
      const order = await prisma.order.findUnique({
        where: { orderId: id },
      });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    // Customer lookup requires email
    const email = request.headers.get("x-customer-email");
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: { orderId: id, email },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[Orders] Get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/** PATCH /api/orders/[id] - Update order (admin only) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin auth
    const adminSecret = request.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const allowedUpdates: Record<string, unknown> = {};
    if (body.paymentStatus) allowedUpdates.paymentStatus = body.paymentStatus;
    if (body.fulfillmentStatus) allowedUpdates.fulfillmentStatus = body.fulfillmentStatus;
    if (body.paymentReference) allowedUpdates.paymentReference = body.paymentReference;
    if (body.paidAt) allowedUpdates.paidAt = body.paidAt;

    const order = await prisma.order.update({
      where: { orderId: id },
      data: allowedUpdates,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("[Orders] Update error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
