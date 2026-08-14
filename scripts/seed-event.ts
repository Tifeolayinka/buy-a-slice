import { getDb } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { CUSTOM_MAX_KOBO, CUSTOM_MIN_KOBO, GIFT_TIERS } from "@/lib/gift-config";

// Provisional seed data — birthday date, timezone, and cutoff are still
// owner decisions per milestone.md M0. Update via a real admin flow once
// confirmed; this only ensures EVENT_SLUG resolves to a live row for
// M3/M4 development.
async function main() {
  const slug = process.env.EVENT_SLUG;
  if (!slug) throw new Error("EVENT_SLUG is not set");

  const sliceTier = GIFT_TIERS.find((tier) => tier.id === "slice")!;
  const bigSliceTier = GIFT_TIERS.find((tier) => tier.id === "big_slice")!;
  const energyTier = GIFT_TIERS.find((tier) => tier.id === "energy")!;

  const birthdayAt = new Date("2026-09-01T00:00:00Z");
  const opensAt = new Date("2026-08-25T00:00:00Z");
  const closesAt = new Date("2026-09-08T00:00:00Z");

  await getDb()
    .insert(events)
    .values({
      slug,
      title: "Buy Tife a Slice",
      birthdayAt,
      opensAt,
      closesAt,
      timezone: "Africa/Lagos",
      status: "live",
      tierSliceKobo: sliceTier.amountKobo!,
      tierBigSliceKobo: bigSliceTier.amountKobo!,
      tierEnergyKobo: energyTier.amountKobo!,
      customMinKobo: CUSTOM_MIN_KOBO,
      customMaxKobo: CUSTOM_MAX_KOBO,
      shareCopy: "It's Tife's birthday. Buy him a slice and leave some love.",
    })
    .onConflictDoUpdate({
      target: events.slug,
      set: { status: "live" },
    });

  console.log(`Seeded event "${slug}".`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
