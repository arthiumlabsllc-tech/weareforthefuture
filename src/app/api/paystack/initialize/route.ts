import { NextRequest, NextResponse } from "next/server";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, amount, metadata } = body;

    if (!email || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Email and a valid amount are required" },
        { status: 400 }
      );
    }

    // Convert GHS to pesewas (GH₵1 = 100 pesewas)
    const amountInPesewas = Math.round(amount * 100);

    const transaction = await initializeTransaction(email, amountInPesewas, metadata);

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
