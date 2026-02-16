import type { PostgrestError } from "@supabase/supabase-js";

function isPostgrestError(value: unknown): value is PostgrestError {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (value as { message: unknown }).message === "string"
  );
}

export function mapBookmarkActionError(error: unknown): string {
  if (!error) {
    return "Unexpected error. Please try again.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (isPostgrestError(error)) {
    if (error.code === "42501") {
      return "Not authorized for this action.";
    }

    if (error.code === "23505") {
      return "Bookmark already exists.";
    }

    return error.message;
  }

  return "Unexpected error. Please try again.";
}
