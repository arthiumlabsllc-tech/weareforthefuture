import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateDeliveryFee } from "@/lib/delivery";
import { z } from "zod/v4";

const createOrderSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  email: z.email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  deliveryMethod: z.enum(["home_delivery", "pickup"]),
  region: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  streetAddress: z.string().optional(),
  notes: z.string().optional(),
  momoProvider: z.enum(["mtn", "vod", "tgo"]).optional(),
  momoPhone: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "At least one item is required"),
});

/** Generate sequential order ID: FTF-2026-0001 */
async function generateOrderId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FTF-${year}-`;

  // Get the latest order for this year
  const latestOrder = await prisma.order.findFirst({
    where: { orderId: { startsWith: prefix } },
    orderBy: { createdAt: "desc" },
    select: { orderId: true },
  });

  let nextNum = 1;
  if (latestOrder) {
    const lastNum = parseInt(latestOrder.orderId.split("-")[2], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}

/** POST /api/orders - Create a new order */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.parse(body);

    // Validate delivery address if home delivery
    if (parsed.deliveryMethod === "home_delivery") {
      if (!parsed.region || !parsed.city) {
        return NextResponse.json(
          { error: "Region and city are required for home delivery" },
          { status: 400 }
        );
      }
    }

    // Calculate subtotal in pesewas
    const subtotalPesewas = parsed.items.reduce(
      (sum, item) => sum + item.price * 100 * item.quantity,
      0
    );

    // Calculate delivery fee server-side (never trust client)
    let deliveryFeePesewas = 0;
    if (parsed.deliveryMethod === "home_delivery" && parsed.region && parsed.city) {
      deliveryFeePesewas = calculateDeliveryFee(
        parsed.region,
        parsed.city,
        parsed.items.map((i) => ({ id: i.productId, price: i.price, qty: i.quantity })),
        subtotalPesewas
      );
    }

    const totalPesewas = subtotalPesewas + deliveryFeePesewas;
    const orderId = await generateOrderId();

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderId,
        customerName: parsed.customerName,
        email: parsed.email,
        phone: parsed.phone,
        deliveryMethod: parsed.deliveryMethod,
        region: parsed.region || null,
        city: parsed.city || null,
        area: parsed.area || null,
        streetAddress: parsed.streetAddress || null,
        notes: parsed.notes || null,
        momoProvider: parsed.momoProvider || null,
        momoPhone: parsed.momoPhone || null,
        items: parsed.items,
        subtotal: subtotalPesewas,
        deliveryFee: deliveryFeePesewas,
        total: totalPesewas,
        currency: "GHS",
        paymentStatus: "pending",
        fulfillmentStatus: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        subtotal: subtotalPesewas,
        deliveryFee: deliveryFeePesewas,
        total: totalPesewas,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("[Orders] Create error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    );
  }
}

/** GET /api/orders - List orders (admin only) */
export async function GET(request: NextRequest) {
  try {
    // Admin auth check
    const adminSecret = request.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const fulfillment = searchParams.get("fulfillment") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, string> = {};
    if (status) where.paymentStatus = status;
    if (fulfillment) where.fulfillmentStatus = fulfillment;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Orders] List error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
