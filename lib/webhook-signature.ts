import { createHmac, timingSafeEqual } from "node:crypto";

// Verifies the `x-paystack-signature` header: HMAC-SHA512 of the raw
// request body, keyed with the secret key, compared in constant time.
// Takes the secret explicitly (never reads env) so it stays a pure,
// directly testable function with no server-only dependency.
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;

  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);

  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}
