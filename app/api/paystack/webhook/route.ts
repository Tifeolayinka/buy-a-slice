import { confirmGiftPayment } from "@/lib/db/mutations";
import { getGiftForVerification } from "@/lib/db/queries";
import { verifyTransaction } from "@/lib/paystack";
import { verifyWebhookSignature } from "@/lib/webhook-signature";

// Paystack's webhook payload is a UX signal at best — every acceptance
// path here re-verifies against Paystack's own /transaction/verify
// endpoint and cross-checks against our own stored gift record rather
// than trusting the posted body (plan.md §7: reference, amount, currency,
// and recipient must all match before a payment is accepted).
export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.error("Paystack webhook received but PAYSTACK_SECRET_KEY is not configured");
    return new Response("Webhook not configured", { status: 503 });
  }

  const signature = request.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event !== "charge.success") {
    // Acknowledge and ignore event types this app doesn't act on.
    return new Response("ok", { status: 200 });
  }

  const reference = event.data?.reference;
  if (typeof reference !== "string") {
    return new Response("Missing reference", { status: 400 });
  }

  const [verified, gift] = await Promise.all([
    verifyTransaction(reference),
    getGiftForVerification(reference),
  ]);

  if (!gift) {
    console.error("Paystack webhook for unknown reference", reference);
    return new Response("Unknown reference", { status: 404 });
  }

  const amountMatches = verified.amountKobo === gift.amountKobo;
  const isConfirmedSuccess =
    verified.status === "success" &&
    verified.reference === reference &&
    verified.currency === "NGN" &&
    amountMatches;

  if (!isConfirmedSuccess) {
    if (!amountMatches) {
      console.error("Paystack amount mismatch for reference", reference, {
        expected: gift.amountKobo,
        verified: verified.amountKobo,
      });
    }
    // Not a confirmed, matching success by Paystack's own record — do not publish.
    return new Response("ok", { status: 200 });
  }

  await confirmGiftPayment(reference, verified.transactionId);

  return new Response("ok", { status: 200 });
}
