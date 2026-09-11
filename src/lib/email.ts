import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@weareforthefuture.org";
const ADMIN_EMAIL = process.env.SENDGRID_ADMIN_EMAIL || "admin@weareforthefuture.org";

interface OrderEmail {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryMethod: string;
  region?: string | null;
  city?: string | null;
  area?: string | null;
  streetAddress?: string | null;
  notes?: string | null;
  items: Array<{ productId: string; name: string; price: number; quantity: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentReference?: string | null;
}

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/** Send order confirmation email to customer */
export async function sendOrderConfirmation(order: OrderEmail): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn("[Email] SendGrid API key not set - skipping customer email");
    return;
  }

  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${item.name} x${item.quantity}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">GH₵${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const deliveryAddress =
    order.deliveryMethod === "home_delivery"
      ? `${order.streetAddress || ""}, ${order.area || ""}, ${order.city || ""}, ${order.region || ""}`
      : "Pickup at FTF Office";

  // Calculate impact message
  const totalGhs = order.total / 100;
  let impactMessage = "Every cedi makes a difference!";
  if (totalGhs >= 450) impactMessage = "Your purchase provides school supplies for multiple children for a full semester!";
  else if (totalGhs >= 220) impactMessage = "Your purchase sends a child to school in style!";
  else if (totalGhs >= 150) impactMessage = "Your purchase gives a child school supplies for a full term!";
  else if (totalGhs >= 100) impactMessage = "Your purchase keeps a child healthy and clean!";

  try {
    await sgMail.send({
      to: order.email,
      from: { email: FROM_EMAIL, name: "For The Future Organization" },
      subject: `Order Confirmed - ${order.orderId}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #1a2332; padding: 32px; text-align: center;">
            <h1 style="color: #D4A843; margin: 0; font-size: 24px;">For The Future Organization</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">Order Confirmation</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1a2332; margin: 0 0 8px;">Thank you, ${order.customerName}!</h2>
            <p style="color: #6b7280; margin: 0 0 24px;">Your order <strong>${order.orderId}</strong> has been confirmed.</p>
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
              <p style="color: #15803d; margin: 0; font-weight: 600;">${impactMessage}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Item</th>
                  <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemsList}</tbody>
            </table>

            <div style="border-top: 2px solid #1a2332; padding-top: 12px; margin-top: 12px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #6b7280;">Subtotal</span>
                <span style="font-weight: 600;">GH₵${(order.subtotal / 100).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #6b7280;">Delivery</span>
                <span style="font-weight: 600;">${order.deliveryFee === 0 ? "FREE" : "GH₵" + (order.deliveryFee / 100).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <span style="font-size: 18px; font-weight: 700; color: #1a2332;">Total</span>
                <span style="font-size: 18px; font-weight: 700; color: #1a2332;">GH₵${(order.total / 100).toFixed(2)}</span>
              </div>
            </div>

            <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-top: 24px;">
              <h3 style="margin: 0 0 8px; font-size: 14px; color: #1a2332;">Delivery Details</h3>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">${deliveryAddress}</p>
              ${order.notes ? `<p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;"><em>Note: ${order.notes}</em></p>` : ""}
            </div>

            ${order.paymentReference ? `<p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">Payment Reference: ${order.paymentReference}</p>` : ""}
          </div>
          <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} For The Future Organization. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("[Email] Failed to send customer confirmation:", error);
  }
}

/** Send admin notification email with order details */
export async function sendAdminNotification(order: OrderEmail): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.warn("[Email] SendGrid API key not set - skipping admin email");
    return;
  }

  const itemsList = order.items
    .map(
      (item) =>
        `<li>${item.name} x${item.quantity} - GH₵${(item.price * item.quantity).toFixed(2)}</li>`
    )
    .join("");

  try {
    await sgMail.send({
      to: ADMIN_EMAIL,
      from: { email: FROM_EMAIL, name: "FTF Order System" },
      subject: `New Order: ${order.orderId} - ${order.customerName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a2332;">New Order Received</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #6b7280;">Order ID</td><td style="padding: 4px 0; font-weight: 600;">${order.orderId}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Customer</td><td style="padding: 4px 0; font-weight: 600;">${order.customerName}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Email</td><td style="padding: 4px 0;">${order.email}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Phone</td><td style="padding: 4px 0;">${order.phone}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Delivery</td><td style="padding: 4px 0;">${order.deliveryMethod === "home_delivery" ? "Home Delivery" : "Pickup"}</td></tr>
            ${order.region ? `<tr><td style="padding: 4px 0; color: #6b7280;">Location</td><td style="padding: 4px 0;">${order.city}, ${order.region}</td></tr>` : ""}
            ${order.streetAddress ? `<tr><td style="padding: 4px 0; color: #6b7280;">Address</td><td style="padding: 4px 0;">${order.streetAddress}</td></tr>` : ""}
            <tr><td style="padding: 4px 0; color: #6b7280;">Total</td><td style="padding: 4px 0; font-weight: 700; font-size: 18px;">GH₵${(order.total / 100).toFixed(2)}</td></tr>
            ${order.paymentReference ? `<tr><td style="padding: 4px 0; color: #6b7280;">Payment Ref</td><td style="padding: 4px 0; font-family: monospace;">${order.paymentReference}</td></tr>` : ""}
          </table>
          <h3 style="margin-top: 16px;">Items</h3>
          <ul>${itemsList}</ul>
          ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ""}
        </div>
      `,
    });
  } catch (error) {
    console.error("[Email] Failed to send admin notification:", error);
  }
}
