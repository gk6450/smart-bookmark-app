"use server";

import { revalidatePath } from "next/cache";

import { getUserSafely } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  AUTH_SERVICE_UNAVAILABLE_MESSAGE,
  BOOKMARKS_SERVICE_UNAVAILABLE_MESSAGE,
} from "@/lib/supabase/shared";
import type { Bookmark } from "@/types/bookmark";

import { mapBookmarkActionError } from "./mappers";
import { bookmarkInputSchema, type BookmarkInput } from "./schemas";

export type ActionError = {
  ok: false;
  error: string;
};

export type CreateBookmarkSuccess = {
  ok: true;
  bookmark: Bookmark;
};

export type DeleteBookmarkSuccess = {
  ok: true;
};

export type UpdateBookmarkSuccess = {
  ok: true;
  bookmark: Bookmark;
};

export type CreateBookmarkResult = CreateBookmarkSuccess | ActionError;
export type DeleteBookmarkResult = DeleteBookmarkSuccess | ActionError;
export type UpdateBookmarkResult = UpdateBookmarkSuccess | ActionError;

export async function createBookmarkAction(input: BookmarkInput): Promise<CreateBookmarkResult> {
  const parsedInput = bookmarkInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Invalid bookmark input.",
    };
  }

  const supabase = await createClient();
  const { user, unavailable } = await getUserSafely(supabase);

  if (unavailable) {
    return { ok: false, error: AUTH_SERVICE_UNAVAILABLE_MESSAGE };
  }

  if (!user) {
    return { ok: false, error: "You need to be logged in." };
  }

  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: user.id,
        title: parsedInput.data.title,
        url: parsedInput.data.url,
      })
      .select("id,user_id,title,url,created_at")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: mapBookmarkActionError(error),
      };
    }

    revalidatePath("/bookmarks");

    return {
      ok: true,
      bookmark: data,
    };
  } catch {
    return {
      ok: false,
      error: BOOKMARKS_SERVICE_UNAVAILABLE_MESSAGE,
    };
  }
}

export async function deleteBookmarkAction(id: string): Promise<DeleteBookmarkResult> {
  if (!id) {
    return { ok: false, error: "Bookmark id is required." };
  }

  const supabase = await createClient();
  const { user, unavailable } = await getUserSafely(supabase);

  if (unavailable) {
    return { ok: false, error: AUTH_SERVICE_UNAVAILABLE_MESSAGE };
  }

  if (!user) {
    return { ok: false, error: "You need to be logged in." };
  }

  try {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return {
        ok: false,
        error: mapBookmarkActionError(error),
      };
    }

    revalidatePath("/bookmarks");

    return {
      ok: true,
    };
  } catch {
    return {
      ok: false,
      error: BOOKMARKS_SERVICE_UNAVAILABLE_MESSAGE,
    };
  }
}

export async function updateBookmarkAction(
  id: string,
  input: BookmarkInput,
): Promise<UpdateBookmarkResult> {
  if (!id) {
    return { ok: false, error: "Bookmark id is required." };
  }

  const parsedInput = bookmarkInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Invalid bookmark input.",
    };
  }

  const supabase = await createClient();
  const { user, unavailable } = await getUserSafely(supabase);

  if (unavailable) {
    return { ok: false, error: AUTH_SERVICE_UNAVAILABLE_MESSAGE };
  }

  if (!user) {
    return { ok: false, error: "You need to be logged in." };
  }

  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .update({
        title: parsedInput.data.title,
        url: parsedInput.data.url,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id,user_id,title,url,created_at")
      .single();

    if (error || !data) {
      return {
        ok: false,
        error: mapBookmarkActionError(error),
      };
    }

    revalidatePath("/bookmarks");

    return {
      ok: true,
      bookmark: data,
    };
  } catch {
    return {
      ok: false,
      error: BOOKMARKS_SERVICE_UNAVAILABLE_MESSAGE,
    };
  }
}
