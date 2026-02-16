import { describe, expect, it } from "vitest";

import { bookmarkInputSchema } from "@/features/bookmarks/schemas";

describe("bookmarkInputSchema", () => {
  it("parses and normalizes valid input", () => {
    const result = bookmarkInputSchema.safeParse({
      title: "Next.js docs",
      url: "nextjs.org/docs",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.url).toBe("https://nextjs.org/docs");
      expect(result.data.title).toBe("Next.js docs");
    }
  });

  it("fails when title is empty", () => {
    const result = bookmarkInputSchema.safeParse({
      title: "",
      url: "https://nextjs.org/docs",
    });

    expect(result.success).toBe(false);
  });

  it("fails when url is invalid", () => {
    const result = bookmarkInputSchema.safeParse({
      title: "Bad URL",
      url: "not a valid url",
    });

    expect(result.success).toBe(false);
  });
});
