import { describe, expect, it } from "vitest";

import { normalizeUrl } from "@/lib/utils/url";

describe("normalizeUrl", () => {
  it("adds https protocol when missing", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com/");
  });

  it("keeps valid https urls", () => {
    expect(normalizeUrl("https://example.com/docs")).toBe("https://example.com/docs");
  });

  it("rejects non-http protocols", () => {
    expect(() => normalizeUrl("javascript:alert(1)")).toThrow("Only http and https URLs are allowed");
  });
});
