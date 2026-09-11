const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface PaystackTransaction {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
}

interface InitOptions {
  email: string;
  amountInPesewas: number;
  metadata?: Record<string, unknown>;
  /** Restrict to specific payment channels */
  channels?: string[];
  /** Mobile Money phone number (for direct MoMo prompt) */
  phone?: string;
}

export async function initializeTransaction(
  email: string,
  amountInPesewas: number,
  metadata?: Record<string, unknown>,
  channels?: string[],
  phone?: string
): Promise<PaystackTransaction> {
  const payload: Record<string, unknown> = {
    email,
    amount: amountInPesewas, // amount in pesewas (GH₵1 = 100 pesewas)
    currency: "GHS",
    metadata: {
      custom_fields: [
        {
          display_name: "Organization",
          variable_name: "organization",
          value: "For The Future Organization",
        },
      ],
      ...metadata,
    },
  };

  if (channels && channels.length > 0) {
    payload.channels = channels;
  }

  if (phone) {
    payload.mobile_money = { phone };
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.message || "Failed to initialize transaction");
  }

  return {
    reference: data.data.reference,
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
  };
}

export async function verifyTransaction(reference: string) {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.message || "Failed to verify transaction");
  }

  return {
    status: data.data.status,
    amount: data.data.amount,
    currency: data.data.currency,
    paidAt: data.data.paid_at,
    channel: data.data.channel,
    customer: data.data.customer,
    gatewayResponse: data.data.gateway_response,
  };
}
