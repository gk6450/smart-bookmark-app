import { describe, expect, it } from "vitest";

import { mapBookmarkActionError } from "@/features/bookmarks/mappers";

describe("mapBookmarkActionError", () => {
  it("maps postgres authorization errors", () => {
    const message = mapBookmarkActionError({
      message: "new row violates row-level security policy",
      code: "42501",
      details: null,
      hint: null,
      name: "PostgrestError",
    });

    expect(message).toBe("Not authorized for this action.");
  });

  it("returns explicit error messages for Error objects", () => {
    expect(mapBookmarkActionError(new Error("boom"))).toBe("boom");
  });

  it("uses fallback message for unknown values", () => {
    expect(mapBookmarkActionError({})).toBe("Unexpected error. Please try again.");
  });
});
