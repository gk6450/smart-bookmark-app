import { redirect } from "next/navigation";

import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { AppShell } from "@/components/layout/app-shell";
import { getUserSafely } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  AUTH_SERVICE_UNAVAILABLE_MESSAGE,
  BOOKMARKS_SERVICE_UNAVAILABLE_MESSAGE,
} from "@/lib/supabase/shared";
import type { Bookmark } from "@/types/bookmark";

export default async function BookmarksPage() {
  const supabase = await createClient();
  const { user, error: userError, unavailable } = await getUserSafely(supabase);

  if (userError || !user) {
    const query = unavailable ? `?error=${encodeURIComponent(AUTH_SERVICE_UNAVAILABLE_MESSAGE)}` : "";
    redirect(`/login${query}`);
  }

  let initialBookmarks: Bookmark[] = [];
  let initialError: string | null = null;

  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id,user_id,title,url,created_at")
      .order("created_at", { ascending: false });

    initialBookmarks = data ?? [];
    initialError = error ? "Could not load bookmarks. Please refresh." : null;
  } catch {
    initialError = BOOKMARKS_SERVICE_UNAVAILABLE_MESSAGE;
  }

  return (
    <AppShell userEmail={user.email ?? "Unknown user"}>
      <BookmarkList
        initialBookmarks={initialBookmarks}
        initialError={initialError}
        userId={user.id}
      />
    </AppShell>
  );
}
