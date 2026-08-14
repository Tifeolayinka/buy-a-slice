import { describe, expect, it } from "vitest";

import { initialsFrom } from "./initials";

describe("initialsFrom", () => {
  it("takes the first letter of up to two words", () => {
    expect(initialsFrom("Ada Lovelace")).toBe("AL");
    expect(initialsFrom("Tife")).toBe("T");
  });

  it("uppercases letters", () => {
    expect(initialsFrom("ada")).toBe("A");
  });

  it("ignores extra whitespace", () => {
    expect(initialsFrom("  Ada   Lovelace  ")).toBe("AL");
  });

  it("falls back for empty input", () => {
    expect(initialsFrom("")).toBe("?");
    expect(initialsFrom("   ")).toBe("?");
  });

  it("handles 'Anonymous'", () => {
    expect(initialsFrom("Anonymous")).toBe("A");
  });
});
