import { randomUUID } from "node:crypto";

// Server-generated, globally unique Paystack transaction reference. Never
// accept a reference from the client (plan.md §7).
export function generatePaymentReference(): string {
  return `bts_${randomUUID()}`;
}
