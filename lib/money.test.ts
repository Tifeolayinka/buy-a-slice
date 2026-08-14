import { describe, expect, it } from "vitest";

import { formatKoboAsNaira, koboToNaira, nairaToKobo } from "./money";

describe("nairaToKobo", () => {
  it("converts whole naira", () => {
    expect(nairaToKobo(1000)).toBe(100000);
    expect(nairaToKobo(2500)).toBe(250000);
  });

  it("rounds fractional kobo from float inputs", () => {
    expect(nairaToKobo(10.005)).toBe(1001);
    expect(nairaToKobo(0.1 + 0.2)).toBe(30);
  });

  it("rejects negative and non-finite amounts", () => {
    expect(() => nairaToKobo(-1)).toThrow();
    expect(() => nairaToKobo(Number.NaN)).toThrow();
    expect(() => nairaToKobo(Number.POSITIVE_INFINITY)).toThrow();
  });
});

describe("koboToNaira", () => {
  it("converts back to naira", () => {
    expect(koboToNaira(100000)).toBe(1000);
    expect(koboToNaira(50)).toBe(0.5);
  });

  it("rejects non-integer kobo", () => {
    expect(() => koboToNaira(10.5)).toThrow();
    expect(() => koboToNaira(-100)).toThrow();
  });
});

describe("formatKoboAsNaira", () => {
  it("formats whole-naira amounts without decimals", () => {
    expect(formatKoboAsNaira(100000)).toBe("₦1,000");
    expect(formatKoboAsNaira(500000)).toBe("₦5,000");
  });

  it("keeps kobo when the amount is not whole naira", () => {
    expect(formatKoboAsNaira(100050)).toBe("₦1,000.50");
  });
});
