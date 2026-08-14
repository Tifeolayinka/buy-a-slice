import { describe, expect, it } from "vitest";

import { giftSubmissionSchema, resolveTierAmountKobo, type EventTierConfig } from "./gift-validation";

const EVENT: EventTierConfig = {
  tierSliceKobo: 1_000_00,
  tierBigSliceKobo: 2_500_00,
  tierEnergyKobo: 5_000_00,
  customMinKobo: 500_00,
  customMaxKobo: 1_000_000_00,
};

describe("resolveTierAmountKobo", () => {
  it("resolves fixed tiers from event config, ignoring any client amount", () => {
    expect(resolveTierAmountKobo("slice", undefined, EVENT)).toEqual({
      ok: true,
      amountKobo: 1_000_00,
    });
    expect(resolveTierAmountKobo("big_slice", undefined, EVENT)).toEqual({
      ok: true,
      amountKobo: 2_500_00,
    });
    expect(resolveTierAmountKobo("energy", undefined, EVENT)).toEqual({
      ok: true,
      amountKobo: 5_000_00,
    });
  });

  it("resolves a valid custom amount", () => {
    expect(resolveTierAmountKobo("custom", 10_000, EVENT)).toEqual({
      ok: true,
      amountKobo: 1_000_000,
    });
  });

  it("rejects a custom amount below the minimum", () => {
    expect(resolveTierAmountKobo("custom", 100, EVENT)).toEqual({
      ok: false,
      reason: "invalid_custom_amount",
    });
  });

  it("rejects a custom amount above the maximum", () => {
    expect(resolveTierAmountKobo("custom", 50_000_000, EVENT)).toEqual({
      ok: false,
      reason: "invalid_custom_amount",
    });
  });

  it("rejects a missing custom amount", () => {
    expect(resolveTierAmountKobo("custom", undefined, EVENT)).toEqual({
      ok: false,
      reason: "invalid_custom_amount",
    });
  });

  it("accepts the exact boundary values", () => {
    expect(resolveTierAmountKobo("custom", 500, EVENT)).toEqual({
      ok: true,
      amountKobo: 500_00,
    });
    expect(resolveTierAmountKobo("custom", 1_000_000, EVENT)).toEqual({
      ok: true,
      amountKobo: 1_000_000_00,
    });
  });
});

describe("giftSubmissionSchema", () => {
  const base = {
    tierId: "slice" as const,
    name: "Ada",
    isAnonymous: false,
    country: "Kenya",
    body: "Happy birthday Tife!",
    category: "wish" as const,
  };

  it("accepts a valid fixed-tier submission", () => {
    expect(giftSubmissionSchema.safeParse(base).success).toBe(true);
  });

  it("requires customAmountNaira for the custom tier", () => {
    const result = giftSubmissionSchema.safeParse({ ...base, tierId: "custom" });
    expect(result.success).toBe(false);
  });

  it("accepts the custom tier with an amount", () => {
    const result = giftSubmissionSchema.safeParse({
      ...base,
      tierId: "custom",
      customAmountNaira: 10_000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-anonymous submission with no name", () => {
    expect(giftSubmissionSchema.safeParse({ ...base, name: "" }).success).toBe(false);
  });
});
