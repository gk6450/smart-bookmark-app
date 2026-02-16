"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/types/bookmark";

type UseBookmarkRealtimeOptions = {
  userId: string;
  onInsert: (bookmark: Bookmark) => void;
  onUpdate: (bookmark: Bookmark) => void;
  onDelete: (bookmarkId: string) => void;
};

export function useBookmarkRealtime({
  userId,
  onInsert,
  onUpdate,
  onDelete,
}: UseBookmarkRealtimeOptions) {
  useEffect(() => {
    const supabase = createClient();
    let isCancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function startSubscription() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Ensures postgres_changes channels are authorized with the logged-in user's token.
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }

      if (isCancelled) {
        return;
      }

      channel = supabase
        .channel(`bookmarks:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            onInsert(payload.new as Bookmark);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            onUpdate(payload.new as Bookmark);
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            onDelete(String(payload.old.id));
          },
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            console.error("Realtime channel error for bookmarks");
          }
        });
    }

    void startSubscription();

    return () => {
      isCancelled = true;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [onDelete, onInsert, onUpdate, userId]);
}
