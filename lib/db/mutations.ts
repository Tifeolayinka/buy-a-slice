import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { messages, moderationAudit, submissionAttempts } from "@/lib/db/schema";
import { checkMessageContent, normalizeCountry } from "@/lib/message-validation";
import type { MessageSubmissionInput } from "@/lib/message-validation";

// Rate limiting bounds submissions per fingerprint/window without a separate
// Redis dependency at this scale (plan.md §7).
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_PER_WINDOW = 5;

export async function isRateLimited(fingerprint: string, kind: "message" | "gift") {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const rows = await getDb()
    .select({ id: submissionAttempts.id })
    .from(submissionAttempts)
    .where(
      and(
        eq(submissionAttempts.fingerprint, fingerprint),
        eq(submissionAttempts.kind, kind),
        gte(submissionAttempts.createdAt, windowStart),
      ),
    )
    .limit(RATE_LIMIT_MAX_PER_WINDOW);

  return rows.length >= RATE_LIMIT_MAX_PER_WINDOW;
}

export type SubmitFreeMessageResult =
  | { ok: true; messageId: string }
  | { ok: false; reason: "rate_limited" | "profanity" | "link" };

// Free-message path (no gift): stored pending, never auto-published.
// The paid path's message insert is part of the M5 payment mutation instead.
//
// The visitor and message inserts are combined in one data-modifying CTE
// rather than db.transaction(): the neon-http driver has no interactive
// transaction support (each call is a single stateless HTTP request), so a
// single atomic statement is the correct primitive here. db.batch() is used
// instead wherever statements don't need each other's generated values (see
// applyModerationAction below).
export async function submitFreeMessage(
  eventId: string,
  fingerprint: string,
  input: MessageSubmissionInput,
): Promise<SubmitFreeMessageResult> {
  if (await isRateLimited(fingerprint, "message")) {
    return { ok: false, reason: "rate_limited" };
  }

  const contentIssue = checkMessageContent(input.body);
  if (contentIssue) {
    return { ok: false, reason: contentIssue };
  }

  const displayName = input.isAnonymous ? "Anonymous" : input.name;
  const normalizedCountry = normalizeCountry(input.country);

  const result = await getDb().execute<{ id: string }>(sql`
    with new_visitor as (
      insert into visitors (event_id, display_name, normalized_country, is_anonymous)
      values (${eventId}, ${displayName}, ${normalizedCountry}, ${input.isAnonymous})
      returning id
    )
    insert into messages (event_id, visitor_id, body, category, is_anonymous, status)
    select ${eventId}, new_visitor.id, ${input.body}, ${input.category}, ${input.isAnonymous}, 'pending'
    from new_visitor
    returning id
  `);

  const messageId = result.rows[0]?.id;
  if (!messageId) {
    throw new Error("submitFreeMessage: insert returned no id");
  }

  await getDb().insert(submissionAttempts).values({ fingerprint, kind: "message" });

  return { ok: true, messageId };
}

export type CreatePendingGiftInput = {
  name: string;
  isAnonymous: boolean;
  country?: string;
  body: string;
  category: string;
  tier: "slice" | "big_slice" | "energy" | "custom";
  amountKobo: number;
  reference: string;
};

export type CreatePendingGiftResult =
  | { ok: true; messageId: string; giftId: string }
  | { ok: false; reason: "profanity" | "link" };

// Visitor, message (pending — never public until payment succeeds), and
// gift (initiated) created atomically via a chained CTE, for the same
// neon-http transaction-support reason as submitFreeMessage above.
export async function createPendingGift(
  eventId: string,
  input: CreatePendingGiftInput,
): Promise<CreatePendingGiftResult> {
  const contentIssue = checkMessageContent(input.body);
  if (contentIssue) {
    return { ok: false, reason: contentIssue };
  }

  const displayName = input.isAnonymous ? "Anonymous" : input.name;
  const normalizedCountry = normalizeCountry(input.country);

  const result = await getDb().execute<{ message_id: string; gift_id: string }>(sql`
    with new_visitor as (
      insert into visitors (event_id, display_name, normalized_country, is_anonymous)
      values (${eventId}, ${displayName}, ${normalizedCountry}, ${input.isAnonymous})
      returning id
    ),
    new_message as (
      insert into messages (event_id, visitor_id, body, category, is_anonymous, status)
      select ${eventId}, new_visitor.id, ${input.body}, ${input.category}, ${input.isAnonymous}, 'pending'
      from new_visitor
      returning id, visitor_id
    ),
    new_gift as (
      insert into gifts (
        event_id, visitor_id, message_id, amount_kobo, currency, tier,
        paystack_reference, status
      )
      select
        ${eventId}, new_message.visitor_id, new_message.id, ${input.amountKobo}, 'NGN',
        ${input.tier}, ${input.reference}, 'initiated'
      from new_message
      returning id, message_id
    )
    select message_id, id as gift_id from new_gift
  `);

  const row = result.rows[0];
  if (!row?.message_id || !row?.gift_id) {
    throw new Error("createPendingGift: insert returned no id");
  }

  return { ok: true, messageId: row.message_id, giftId: row.gift_id };
}

export type ConfirmGiftPaymentResult =
  | { newlyConfirmed: true; messageId: string }
  | { newlyConfirmed: false };

// Idempotent: repeated or duplicate webhook deliveries for an already-
// confirmed gift are no-ops. Both updates happen in one atomic statement
// (a data-modifying CTE) rather than two sequential calls — with the
// neon-http driver's lack of transaction support, two separate calls would
// leave a window where a crash between them marks the gift paid without
// approving its message, and a webhook retry would then skip both (the
// first update's guard would already be satisfied). A single statement
// closes that gap.
export async function confirmGiftPayment(
  reference: string,
  transactionId: string,
): Promise<ConfirmGiftPaymentResult> {
  const result = await getDb().execute<{ id: string }>(sql`
    with updated_gift as (
      update gifts
      set status = 'success', paid_at = now(), paystack_transaction_id = ${transactionId},
        last_verified_at = now()
      where paystack_reference = ${reference} and status <> 'success'
      returning id, message_id
    )
    update messages
    set status = 'approved', moderated_at = now()
    from updated_gift
    where messages.id = updated_gift.message_id
    returning messages.id
  `);

  const messageId = result.rows[0]?.id;
  if (!messageId) return { newlyConfirmed: false };
  return { newlyConfirmed: true, messageId };
}

export type ModerationAction = "approve" | "reject" | "feature" | "unfeature";

export async function applyModerationAction(
  messageId: string,
  action: ModerationAction,
  actorLabel: string,
  reason?: string,
) {
  const db = getDb();

  const statusUpdate =
    action === "approve"
      ? db
          .update(messages)
          .set({ status: "approved", moderatedAt: new Date(), moderationReason: reason ?? null })
          .where(eq(messages.id, messageId))
      : action === "reject"
        ? db
            .update(messages)
            .set({ status: "rejected", moderatedAt: new Date(), moderationReason: reason ?? null })
            .where(eq(messages.id, messageId))
        : db
            .update(messages)
            .set({ isFeatured: action === "feature" })
            .where(eq(messages.id, messageId));

  const auditInsert = db.insert(moderationAudit).values({
    messageId,
    action,
    reason: reason ?? null,
    actorLabel,
  });

  await db.batch([statusUpdate, auditInsert]);
}
