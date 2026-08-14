import { z } from "zod";

import { CATEGORIES } from "@/lib/gift-config";

// Shared between the client gift-flow form and the server-side
// /api/gifts/initialize route. Amount resolution is separate (below) since
// it depends on live event config, not just input shape.

const categoryValues = CATEGORIES.map((entry) => entry.id) as [string, ...string[]];
const TIER_IDS = ["slice", "big_slice", "energy", "custom"] as const;

export const giftSubmissionSchema = z
  .object({
    tierId: z.enum(TIER_IDS),
    customAmountNaira: z.number().positive().optional(),
    name: z.string().trim().max(80),
    isAnonymous: z.boolean(),
    country: z.string().trim().max(80).optional().or(z.literal("")),
    body: z.string().trim().min(1).max(280),
    category: z.enum(categoryValues),
  })
  .refine((data) => data.isAnonymous || data.name.length > 0, {
    message: "Name is required unless posting anonymously",
    path: ["name"],
  })
  .refine((data) => data.tierId !== "custom" || data.customAmountNaira !== undefined, {
    message: "Custom amount is required for this tier",
    path: ["customAmountNaira"],
  });

export type GiftSubmissionInput = z.infer<typeof giftSubmissionSchema>;

// The subset of the `events` row needed to resolve an authoritative amount,
// kept narrow so this stays testable without a Drizzle row shape.
export type EventTierConfig = {
  tierSliceKobo: number;
  tierBigSliceKobo: number;
  tierEnergyKobo: number;
  customMinKobo: number;
  customMaxKobo: number;
};

export type ResolveTierAmountResult =
  | { ok: true; amountKobo: number }
  | { ok: false; reason: "invalid_custom_amount" };

export function resolveTierAmountKobo(
  tierId: GiftSubmissionInput["tierId"],
  customAmountNaira: number | undefined,
  event: EventTierConfig,
): ResolveTierAmountResult {
  if (tierId === "slice") return { ok: true, amountKobo: event.tierSliceKobo };
  if (tierId === "big_slice") return { ok: true, amountKobo: event.tierBigSliceKobo };
  if (tierId === "energy") return { ok: true, amountKobo: event.tierEnergyKobo };

  // tierId === "custom"
  if (customAmountNaira === undefined) return { ok: false, reason: "invalid_custom_amount" };
  const amountKobo = Math.round(customAmountNaira * 100);
  if (amountKobo < event.customMinKobo || amountKobo > event.customMaxKobo) {
    return { ok: false, reason: "invalid_custom_amount" };
  }
  return { ok: true, amountKobo };
}
