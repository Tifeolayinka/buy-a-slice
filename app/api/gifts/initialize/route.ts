import { createPendingGift, isRateLimited } from "@/lib/db/mutations";
import { getLiveEvent } from "@/lib/db/queries";
import { fingerprintFromRequest } from "@/lib/fingerprint";
import { giftSubmissionSchema, resolveTierAmountKobo } from "@/lib/gift-validation";
import { initializeTransaction } from "@/lib/paystack";
import { generatePaymentReference } from "@/lib/reference";

function siteOrigin(request: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  const event = await getLiveEvent();
  if (!event) {
    return Response.json({ error: "No live event configured" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = giftSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "invalid_input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const amountResult = resolveTierAmountKobo(
    parsed.data.tierId,
    parsed.data.customAmountNaira,
    event,
  );
  if (!amountResult.ok) {
    return Response.json({ error: amountResult.reason }, { status: 422 });
  }

  const fingerprint = fingerprintFromRequest(request);
  if (await isRateLimited(fingerprint, "gift")) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const reference = generatePaymentReference();

  const giftResult = await createPendingGift(event.id, {
    name: parsed.data.name,
    isAnonymous: parsed.data.isAnonymous,
    country: parsed.data.country,
    body: parsed.data.body,
    category: parsed.data.category,
    tier: parsed.data.tierId,
    amountKobo: amountResult.amountKobo,
    reference,
  });

  if (!giftResult.ok) {
    return Response.json({ error: giftResult.reason }, { status: 422 });
  }

  try {
    // No email is collected in the gift flow — the PRD's mockup has none
    // and the product's stated goal is a sub-60-second, login-free flow.
    // Paystack requires a syntactically valid email for the receipt
    // destination; a synthetic, reference-scoped address is used instead
    // of adding friction. Worth an explicit owner call on whether buyers
    // should get a real payment receipt (tracked in milestone.md).
    const { authorizationUrl } = await initializeTransaction({
      email: `${reference}@buyers.buy-a-slice.app`,
      amountKobo: amountResult.amountKobo,
      reference,
      callbackUrl: `${siteOrigin(request)}/success?reference=${reference}`,
      metadata: { eventId: event.id, giftId: giftResult.giftId, tier: parsed.data.tierId },
    });

    return Response.json({ authorizationUrl, reference });
  } catch (error) {
    console.error("Paystack initialize failed", error);
    return Response.json({ error: "payment_init_failed" }, { status: 502 });
  }
}
