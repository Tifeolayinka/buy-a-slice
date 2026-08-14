import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { confirmGiftPayment, createPendingGift } from "@/lib/db/mutations";
import { getLiveEvent, getPaymentStatusByReference, getWallStats } from "@/lib/db/queries";
import { gifts, messages, moderationAudit, visitors } from "@/lib/db/schema";
import { generatePaymentReference } from "@/lib/reference";

async function main() {
  const event = await getLiveEvent();
  if (!event) throw new Error("No live event — run scripts/seed-event.ts first");

  const reference = generatePaymentReference();
  console.log("reference:", reference);

  const created = await createPendingGift(event.id, {
    name: "Ada",
    isAnonymous: false,
    country: "Kenya",
    body: "Verification script: gift flow idempotency check.",
    category: "wish",
    tier: "slice",
    amountKobo: 1_000_00,
    reference,
  });
  if (!created.ok) throw new Error(`createPendingGift failed: ${created.reason}`);
  console.log("created pending gift:", created);

  const beforeStats = await getWallStats(event.id);
  console.log("stats before confirmation (should be unchanged by pending gift):", beforeStats);

  const statusBefore = await getPaymentStatusByReference(reference);
  console.log("payment status before confirmation:", statusBefore);
  if (statusBefore?.status !== "initiated") {
    throw new Error(`Expected status "initiated", got ${statusBefore?.status}`);
  }

  const first = await confirmGiftPayment(reference, "test-transaction-id");
  console.log("first confirmGiftPayment call:", first);
  if (!first.newlyConfirmed) throw new Error("Expected first confirmation to be newlyConfirmed");

  const second = await confirmGiftPayment(reference, "test-transaction-id");
  console.log("second confirmGiftPayment call (duplicate webhook):", second);
  if (second.newlyConfirmed) throw new Error("Expected duplicate confirmation to be a no-op");

  const statusAfter = await getPaymentStatusByReference(reference);
  console.log("payment status after confirmation:", statusAfter);
  if (statusAfter?.status !== "success" || !statusAfter.message) {
    throw new Error("Expected status success with a published message");
  }

  const afterStats = await getWallStats(event.id);
  console.log("stats after confirmation:", afterStats);
  if (afterStats.totalGifts !== beforeStats.totalGifts + 1) {
    throw new Error("Expected totalGifts to increase by exactly 1");
  }

  console.log("\nAll assertions passed. Cleaning up test data...");

  const [msgRow] = await getDb()
    .select({ visitorId: messages.visitorId })
    .from(messages)
    .where(eq(messages.id, created.messageId));

  await getDb().delete(moderationAudit).where(eq(moderationAudit.messageId, created.messageId));
  await getDb().delete(gifts).where(eq(gifts.id, created.giftId));
  await getDb().delete(messages).where(eq(messages.id, created.messageId));
  if (msgRow) {
    await getDb().delete(visitors).where(eq(visitors.id, msgRow.visitorId));
  }

  console.log("Cleanup complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
