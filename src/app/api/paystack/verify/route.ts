import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: "Transaction reference is required" },
        { status: 400 }
      );
    }

    const result = await verifyTransaction(reference);

    return NextResponse.json({
      success: true,
      verified: result.status === "success",
      ...result,
    });
  } catch (error) {
    console.error("Paystack verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment verification failed" },
      { status: 500 }
    );
  }
}
