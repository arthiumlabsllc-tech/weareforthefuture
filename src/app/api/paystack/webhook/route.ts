import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

/**
 * Verify Paystack webhook signature.
 * Paystack signs every webhook event with HMAC-SHA512 using your secret key.
 */
function verifySignature(body: string, signature: string): boolean {
  if (!PAYSTACK_SECRET_KEY || !signature) return false;

  const computedHash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");

  return computedHash === signature;
}

export async function POST(request: NextRequest) {
  // Read raw body as text (needed for signature verification)
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";

  // Verify the webhook is genuinely from Paystack
  if (!verifySignature(rawBody, signature)) {
    console.error("[Paystack Webhook] Invalid signature - request rejected");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const eventType = event.event as string;

  // Log every event for debugging
  console.log(`[Paystack Webhook] Event: ${eventType}`, {
    reference: (event.data as Record<string, unknown>)?.reference,
    amount: (event.data as Record<string, unknown>)?.amount,
    email: ((event.data as Record<string, unknown>)?.customer as Record<string, unknown>)?.email,
    paid_at: (event.data as Record<string, unknown>)?.paid_at,
    channel: (event.data as Record<string, unknown>)?.channel,
  });

  // Handle successful charges
  if (eventType === "charge.success") {
    const data = event.data as Record<string, unknown>;
    const customer = data.customer as Record<string, unknown>;
    const metadata = data.metadata as Record<string, unknown> | undefined;
    const customFields = metadata?.custom_fields as Array<Record<string, unknown>> | undefined;

    const reference = data.reference as string;

    // Try to find and update an existing order by payment reference
    const existingOrder = await prisma.order.findFirst({
      where: { paymentReference: reference },
    });

    if (existingOrder) {
      // Update order to paid
      const updatedOrder = await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          paymentStatus: "paid",
          paidAt: new Date(data.paid_at as string || Date.now()),
          channel: data.channel as string,
        },
      });

      console.log(`[Paystack Webhook] Order ${updatedOrder.orderId} marked as paid`);

      // Send email notifications
      const orderItems = typeof updatedOrder.items === "string"
        ? JSON.parse(updatedOrder.items)
        : updatedOrder.items;

      const emailData = {
        orderId: updatedOrder.orderId,
        customerName: updatedOrder.customerName,
        email: updatedOrder.email,
        phone: updatedOrder.phone,
        deliveryMethod: updatedOrder.deliveryMethod,
        region: updatedOrder.region,
        city: updatedOrder.city,
        area: updatedOrder.area,
        streetAddress: updatedOrder.streetAddress,
        notes: updatedOrder.notes,
        items: orderItems,
        subtotal: updatedOrder.subtotal,
        deliveryFee: updatedOrder.deliveryFee,
        total: updatedOrder.total,
        currency: updatedOrder.currency,
        paymentReference: updatedOrder.paymentReference,
      };

      await sendOrderConfirmation(emailData);
      await sendAdminNotification(emailData);
    } else {
      // No matching order - this might be a donation payment
      // Log the transaction for records
      const donorNameField = customFields?.find(
        (f) => f.variable_name === "donor_name" || f.display_name === "Donor Name"
      );

      const transactionRecord = {
        timestamp: new Date().toISOString(),
        reference: data.reference,
        amount_in_pesewas: data.amount,
        amount_ghs: typeof data.amount === "number" ? data.amount / 100 : null,
        currency: data.currency,
        channel: data.channel,
        status: data.status,
        paid_at: data.paid_at,
        gateway_response: data.gateway_response,
        customer: {
          email: customer?.email,
          first_name: customer?.first_name,
          last_name: customer?.last_name,
          phone: customer?.phone,
        },
        donor_name: donorNameField?.value || null,
        source: customFields?.find((f) => f.variable_name === "source")?.value || null,
      };

      console.log("[Paystack Webhook] Transaction (donation):", JSON.stringify(transactionRecord, null, 2));
    }
  }

  // Handle failed charges
  if (eventType === "charge.failed") {
    const data = event.data as Record<string, unknown>;
    const reference = data.reference as string;

    console.log("[Paystack Webhook] Failed charge:", {
      reference,
      amount: data.amount,
      email: (data.customer as Record<string, unknown>)?.email,
      gateway_response: data.gateway_response,
    });

    // Update order status to failed if it exists
    const existingOrder = await prisma.order.findFirst({
      where: { paymentReference: reference },
    });

    if (existingOrder && existingOrder.paymentStatus !== "paid") {
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: { paymentStatus: "failed" },
      });
      console.log(`[Paystack Webhook] Order ${existingOrder.orderId} marked as failed`);
    }
  }

  // Always return 200 to acknowledge receipt (Paystack requirement)
  // Returning non-200 causes Paystack to retry the webhook
  return NextResponse.json({ received: true });
}
