import { z } from "zod";

import { normalizeUrl } from "@/lib/utils/url";

const bookmarkInputRawSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  url: z.string().trim().min(1, "URL is required"),
});

export const bookmarkInputSchema = bookmarkInputRawSchema.transform((value, ctx) => {
  try {
    return {
      title: value.title,
      url: normalizeUrl(value.url),
    };
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a valid URL (http/https)",
      path: ["url"],
    });
    return z.NEVER;
  }
});

export type BookmarkInput = z.output<typeof bookmarkInputSchema>;
