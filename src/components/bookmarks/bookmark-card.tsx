"use client";

import { motion } from "motion/react";
import { Check, Clock3, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

import type { BookmarkInput } from "@/features/bookmarks/schemas";
import { bookmarkInputSchema } from "@/features/bookmarks/schemas";
import type { Bookmark } from "@/types/bookmark";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

type BookmarkCardProps = {
  bookmark: Bookmark;
  isDeleting: boolean;
  isUpdating: boolean;
  isOptimistic?: boolean;
  onUpdate: (id: string, input: BookmarkInput) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
};

export function BookmarkCard({
  bookmark,
  isDeleting,
  isUpdating,
  isOptimistic = false,
  onUpdate,
  onDelete,
}: BookmarkCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(bookmark.title);
  const [url, setUrl] = useState(bookmark.url);
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});

  function startEditing() {
    setTitle(bookmark.title);
    setUrl(bookmark.url);
    setErrors({});
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setErrors({});
  }

  async function saveEdit() {
    const parsed = bookmarkInputSchema.safeParse({ title, url });
    if (!parsed.success) {
      const nextErrors: { title?: string; url?: string } = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "title") {
          nextErrors.title = issue.message;
        }
        if (issue.path[0] === "url") {
          nextErrors.url = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    const success = await onUpdate(bookmark.id, parsed.data);
    if (success) {
      setIsEditing(false);
      setErrors({});
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="glass-panel group p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Title"
                  aria-invalid={Boolean(errors.title)}
                />
                {errors.title ? <p className="mt-1 text-xs text-rose-200">{errors.title}</p> : null}
              </div>
              <div>
                <Input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="example.com"
                  aria-invalid={Boolean(errors.url)}
                />
                {errors.url ? <p className="mt-1 text-xs text-rose-200">{errors.url}</p> : null}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <h3 className="line-clamp-1 text-base font-semibold text-slate-50">{bookmark.title}</h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-cyan-200 transition hover:text-cyan-100"
              >
                <span className="line-clamp-1 break-all">{bookmark.url}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isUpdating}
                aria-label={`Save ${bookmark.title}`}
                onClick={saveEdit}
                className="text-emerald-100 hover:bg-emerald-300/20"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isUpdating}
                aria-label={`Cancel editing ${bookmark.title}`}
                onClick={cancelEditing}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isDeleting || isUpdating || isOptimistic}
              aria-label={`Edit ${bookmark.title}`}
              onClick={startEditing}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isEditing || isDeleting || isUpdating || isOptimistic}
            aria-label={`Delete ${bookmark.title}`}
            onClick={() => onDelete(bookmark.id)}
            className="text-rose-100 hover:bg-rose-300/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
        <span>{new Date(bookmark.created_at).toLocaleString()}</span>
        {isOptimistic ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200/35 bg-cyan-200/12 px-2 py-1 text-cyan-100">
            <Clock3 className="h-3 w-3" />
            Syncing
          </span>
        ) : null}
        {isUpdating ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200/35 bg-cyan-200/12 px-2 py-1 text-cyan-100">
            <Clock3 className="h-3 w-3" />
            Updating
          </span>
        ) : null}
      </div>
    </motion.article>
  );
}
