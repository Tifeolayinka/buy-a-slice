import { describe, expect, it } from "vitest";

import { relativeTime } from "./relative-time";

describe("relativeTime", () => {
  it("returns 'just now' for very recent timestamps", () => {
    expect(relativeTime(new Date().toISOString())).toBe("just now");
  });

  it("formats minutes ago", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(relativeTime(fiveMinutesAgo)).toBe("5 minutes ago");
  });

  it("formats hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(twoHoursAgo)).toBe("2 hours ago");
  });

  it("formats days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(relativeTime(threeDaysAgo)).toBe("3 days ago");
  });
});
