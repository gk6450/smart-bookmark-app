"use client";

import { AnimatePresence } from "motion/react";
import { AlertCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createBookmarkAction,
  deleteBookmarkAction,
  updateBookmarkAction,
} from "@/features/bookmarks/actions";
import type { BookmarkInput } from "@/features/bookmarks/schemas";
import { useBookmarkRealtime } from "@/features/bookmarks/hooks/use-bookmark-realtime";
import type { Bookmark } from "@/types/bookmark";

import { BookmarkCard } from "./bookmark-card";
import { BookmarkForm } from "./bookmark-form";
import { EmptyState } from "./empty-state";

type BookmarkListProps = {
  initialBookmarks: Bookmark[];
  initialError?: string | null;
  userId: string;
};

type BookmarkItem = Bookmark & {
  optimistic?: boolean;
};

function sortBookmarks(items: BookmarkItem[]): BookmarkItem[] {
  return [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function upsertBookmark(items: BookmarkItem[], incoming: Bookmark): BookmarkItem[] {
  const existingIndex = items.findIndex((item) => item.id === incoming.id);
  if (existingIndex >= 0) {
    const next = [...items];
    next[existingIndex] = incoming;
    return sortBookmarks(next);
  }

  return sortBookmarks([incoming, ...items]);
}

export function BookmarkList({ initialBookmarks, initialError, userId }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(initialBookmarks);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const onRealtimeInsert = useCallback((bookmark: Bookmark) => {
    setBookmarks((current) => upsertBookmark(current, bookmark));
  }, []);

  const onRealtimeDelete = useCallback((bookmarkId: string) => {
    setBookmarks((current) => current.filter((item) => item.id !== bookmarkId));
  }, []);

  const onRealtimeUpdate = useCallback((bookmark: Bookmark) => {
    setBookmarks((current) => upsertBookmark(current, bookmark));
  }, []);

  useBookmarkRealtime({
    userId,
    onInsert: onRealtimeInsert,
    onUpdate: onRealtimeUpdate,
    onDelete: onRealtimeDelete,
  });

  const visibleBookmarks = useMemo(() => sortBookmarks(bookmarks), [bookmarks]);

  const handleCreate = useCallback(
    async (input: BookmarkInput): Promise<boolean> => {
      setIsCreating(true);

      const optimisticId = `temp-${Date.now()}`;
      const optimisticBookmark: BookmarkItem = {
        id: optimisticId,
        user_id: userId,
        title: input.title,
        url: input.url,
        created_at: new Date().toISOString(),
        optimistic: true,
      };

      setBookmarks((current) => upsertBookmark(current, optimisticBookmark));

      const result = await createBookmarkAction(input);

      if (!result.ok) {
        setBookmarks((current) => current.filter((item) => item.id !== optimisticId));
        toast.error(result.error);
        setIsCreating(false);
        return false;
      }

      setBookmarks((current) => {
        const withoutOptimistic = current.filter((item) => item.id !== optimisticId);
        return upsertBookmark(withoutOptimistic, result.bookmark);
      });

      toast.success("Bookmark added");
      setIsCreating(false);
      return true;
    },
    [userId],
  );

  const handleDelete = useCallback(async (bookmarkId: string): Promise<void> => {
    let removedBookmark: BookmarkItem | undefined;

    setBookmarks((current) => {
      removedBookmark = current.find((item) => item.id === bookmarkId);
      return current.filter((item) => item.id !== bookmarkId);
    });

    setDeletingIds((current) => ({ ...current, [bookmarkId]: true }));

    const result = await deleteBookmarkAction(bookmarkId);
    if (!result.ok) {
      if (removedBookmark) {
        setBookmarks((current) => upsertBookmark(current, removedBookmark as Bookmark));
      }
      toast.error(result.error);
    } else {
      toast.success("Bookmark deleted");
    }

    setDeletingIds((current) => {
      const next = { ...current };
      delete next[bookmarkId];
      return next;
    });
  }, []);

  const handleUpdate = useCallback(
    async (bookmarkId: string, input: BookmarkInput): Promise<boolean> => {
      const previousBookmark = bookmarks.find((item) => item.id === bookmarkId);
      if (!previousBookmark) {
        return false;
      }

      const optimisticBookmark: Bookmark = {
        ...previousBookmark,
        title: input.title,
        url: input.url,
      };

      setUpdatingIds((current) => ({ ...current, [bookmarkId]: true }));
      setBookmarks((current) => upsertBookmark(current, optimisticBookmark));

      const result = await updateBookmarkAction(bookmarkId, input);
      if (!result.ok) {
        setBookmarks((current) => upsertBookmark(current, previousBookmark));
        toast.error(result.error);
        setUpdatingIds((current) => {
          const next = { ...current };
          delete next[bookmarkId];
          return next;
        });
        return false;
      }

      setBookmarks((current) => upsertBookmark(current, result.bookmark));
      toast.success("Bookmark updated");
      setUpdatingIds((current) => {
        const next = { ...current };
        delete next[bookmarkId];
        return next;
      });
      return true;
    },
    [bookmarks],
  );

  return (
    <section className="space-y-4">
      <BookmarkForm isCreating={isCreating} onCreate={handleCreate} />

      {initialError ? (
        <div className="glass-panel flex items-center gap-2 border border-rose-300/35 bg-rose-300/10 p-3 text-sm text-rose-100">
          <AlertCircle className="h-4 w-4" />
          {initialError}
        </div>
      ) : null}

      {visibleBookmarks.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          <AnimatePresence initial={false}>
            {visibleBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                isDeleting={Boolean(deletingIds[bookmark.id])}
                isUpdating={Boolean(updatingIds[bookmark.id])}
                isOptimistic={Boolean(bookmark.optimistic)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
