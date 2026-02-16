import { redirect } from "next/navigation";

import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function BookmarksPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id,user_id,title,url,created_at")
    .order("created_at", { ascending: false });

  return (
    <AppShell userEmail={user.email ?? "Unknown user"}>
      <BookmarkList
        initialBookmarks={data ?? []}
        initialError={error ? "Could not load bookmarks. Please refresh." : null}
        userId={user.id}
      />
    </AppShell>
  );
}
