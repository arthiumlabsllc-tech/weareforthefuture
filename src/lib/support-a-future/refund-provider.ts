import "server-only";
import { z } from "zod";
import { assertPesewas, pesewasSchema, SupportError } from "./domain";
import { assertFinancialEnvironment } from "./security";

const idSchema = z.union([z.string().regex(/^\d+$/), z.number().int().positive().max(Number.MAX_SAFE_INTEGER)]).transform(String);
const refundSchema = z.object({
  id: idSchema, transaction: z.union([idSchema, z.object({ id: idSchema, reference: z.string() })]),
  amount: pesewasSchema, currency: z.string(), status: z.enum(["pending", "processing", "processed", "failed", "needs-attention"]),
  merchant_note: z.string().nullish(), refunded_at: z.iso.datetime({ offset: true }).nullish(),
  dispute: z.unknown().optional(),
});
export type ProviderRefund = z.infer<typeof refundSchema>;
export const refundOperationNote = (operationId: string) => `FTF excess resolution ${operationId}`;
export const refundTransactionId = (refund: ProviderRefund) => typeof refund.transaction === "string" ? refund.transaction : refund.transaction.id;

async function request(path: string, payload?: Record<string, unknown>) {
  assertFinancialEnvironment();
  const response = await fetch(`https://api.paystack.co${path}`, {
    method: payload ? "POST" : "GET", cache: "no-store", signal: AbortSignal.timeout(15_000),
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const result = z.object({ status: z.literal(true), data: z.unknown() }).safeParse(await response.json());
  if (!response.ok || !result.success) throw new SupportError("provider_unavailable", "Provider confirmation is unavailable.", 502);
  return result.data.data;
}

export async function createExcessRefund(reference: string, excess: number, operationId: string) {
  // This parameter is deliberately mandatory. Paystack defaults an omitted amount to the original gift.
  assertPesewas(excess);
  return refundSchema.parse(await request("/refund", {
    transaction: reference, amount: excess, currency: "GHS", merchant_note: refundOperationNote(operationId),
    customer_note: "Refund of unallocated excess. The original case allocation is unchanged.",
  }));
}

export async function fetchRefund(id: string) {
  idSchema.parse(id);
  return refundSchema.parse(await request(`/refund/${encodeURIComponent(id)}`));
}

export async function listTransactionRefunds(transactionId: string) {
  idSchema.parse(transactionId);
  const all: ProviderRefund[] = [];
  for (let page = 1; page <= 5; page++) {
    const query = new URLSearchParams({ transaction: transactionId, perPage: "100", page: String(page) });
    const rows = z.array(refundSchema).parse(await request(`/refund?${query}`));
    if (rows.some((refund) => refundTransactionId(refund) !== transactionId)) {
      throw new SupportError("provider_mismatch", "Refund history needs reconciliation.", 409);
    }
    all.push(...rows);
    if (rows.length < 100) return all;
  }
  throw new SupportError("provider_reconciliation", "Refund history needs manual reconciliation.", 409);
}

export async function fetchDispute(id: string) {
  idSchema.parse(id);
  return z.object({ id: idSchema, transaction: z.union([idSchema, z.object({ id: idSchema, reference: z.string().optional() })]) })
    .parse(await request(`/dispute/${encodeURIComponent(id)}`));
}

export async function fetchPaymentPointer(id: string) {
  idSchema.parse(id);
  const payment = z.object({ id: idSchema, reference: z.string().regex(/^[A-Za-z0-9._=-]{1,100}$/) })
    .parse(await request(`/transaction/${encodeURIComponent(id)}`));
  if (payment.id !== id) throw new SupportError("provider_mismatch", "Provider confirmation needs reconciliation.", 409);
  return payment;
}

export async function transactionHasDisputes(id: string) {
  idSchema.parse(id);
  const rows = z.array(z.unknown()).parse(await request(`/dispute/transaction/${encodeURIComponent(id)}`));
  return rows.length > 0;
}
