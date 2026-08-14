import "server-only";

export { verifyWebhookSignature } from "@/lib/webhook-signature";

// Thin wrapper around Paystack's REST API (https://api.paystack.co).
// Implemented against their standard documented conventions. Not yet
// exercised against a live Paystack account — PAYSTACK_SECRET_KEY is not
// configured (owner action, see milestone.md M0/M5).

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

type InitializeTransactionParams = {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
};

type InitializeTransactionResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export async function initializeTransaction(
  params: InitializeTransactionParams,
): Promise<InitializeTransactionResult> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      currency: "NGN",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(`Paystack initialize failed: ${data.message ?? res.status}`);
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}

export type VerifiedTransaction = {
  status: "success" | "failed" | "abandoned" | "pending";
  reference: string;
  amountKobo: number;
  currency: string;
  transactionId: string;
};

// Independent server-to-server check — never trust the webhook payload or
// the client redirect alone (plan.md §7).
export async function verifyTransaction(reference: string): Promise<VerifiedTransaction> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey()}` } },
  );

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(`Paystack verify failed: ${data.message ?? res.status}`);
  }

  return {
    status: data.data.status,
    reference: data.data.reference,
    amountKobo: data.data.amount,
    currency: data.data.currency,
    transactionId: String(data.data.id),
  };
}

