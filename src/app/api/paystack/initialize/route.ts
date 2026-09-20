import { NextRequest, NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, amount, metadata, channels, phone } = body;

    if (!email || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Email and a valid amount are required" },
        { status: 400 }
      );
    }

    // Preview safety: a LIVE Paystack secret key may only initialize real
    // transactions on the production deployment. On Vercel preview/branch builds
    // (VERCEL_ENV !== "production") a live key is refused, so no real money can
    // move from a preview. Test keys (sk_test_*) are allowed everywhere and only
    // create test-mode transactions.
    const isProduction = process.env.VERCEL_ENV === "production";
    const secretKey = process.env.PAYSTACK_SECRET_KEY || "";
    if (!isProduction && secretKey.startsWith("sk_live_")) {
      return NextResponse.json(
        { error: "Payments are disabled on preview deployments." },
        { status: 403 }
      );
    }

    // Convert GHS to pesewas (GH₵1 = 100 pesewas)
    const amountInPesewas = Math.round(amount * 100);

    const transaction = await initializeTransaction(
      email,
      amountInPesewas,
      metadata,
      channels,
      phone
    );

    return NextResponse.json({
      success: true,
      ...transaction,
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment initialization failed" },
      { status: 500 }
    );
  }
}
