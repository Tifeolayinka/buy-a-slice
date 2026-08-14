import { describe, expect, it } from "vitest";

import {
  checkMessageContent,
  messageSubmissionSchema,
  normalizeCountry,
} from "./message-validation";

describe("messageSubmissionSchema", () => {
  const base = {
    name: "Ada",
    isAnonymous: false,
    country: "Kenya",
    body: "Happy birthday Tife!",
    category: "wish" as const,
  };

  it("accepts a valid named submission", () => {
    expect(messageSubmissionSchema.safeParse(base).success).toBe(true);
  });

  it("accepts an anonymous submission with no name", () => {
    const result = messageSubmissionSchema.safeParse({
      ...base,
      name: "",
      isAnonymous: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-anonymous submission with no name", () => {
    const result = messageSubmissionSchema.safeParse({ ...base, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty message body", () => {
    const result = messageSubmissionSchema.safeParse({ ...base, body: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a message body over 280 characters", () => {
    const result = messageSubmissionSchema.safeParse({
      ...base,
      body: "a".repeat(281),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown category", () => {
    const result = messageSubmissionSchema.safeParse({ ...base, category: "spam" });
    expect(result.success).toBe(false);
  });
});

describe("checkMessageContent", () => {
  it("flags profanity", () => {
    expect(checkMessageContent("fuck you")).toBe("profanity");
  });

  it("flags links", () => {
    expect(checkMessageContent("check this out https://example.com")).toBe("link");
    expect(checkMessageContent("visit www.example.com")).toBe("link");
  });

  it("passes clean messages", () => {
    expect(checkMessageContent("Happy birthday Tife! Cheers to more wins.")).toBeNull();
  });
});

describe("normalizeCountry", () => {
  it("trims whitespace", () => {
    expect(normalizeCountry("  Nigeria  ")).toBe("Nigeria");
  });

  it("returns null for empty or missing input", () => {
    expect(normalizeCountry("")).toBeNull();
    expect(normalizeCountry("   ")).toBeNull();
    expect(normalizeCountry(undefined)).toBeNull();
  });
});
