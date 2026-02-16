"use client";

import { Globe2, PlusCircle } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { BookmarkInput } from "@/features/bookmarks/schemas";
import { bookmarkInputSchema } from "@/features/bookmarks/schemas";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

type BookmarkFormProps = {
  isCreating: boolean;
  onCreate: (input: BookmarkInput) => Promise<boolean>;
};

export function BookmarkForm({ isCreating, onCreate }: BookmarkFormProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

    setErrors({});
    const success = await onCreate(parsed.data);
    if (success) {
      setTitle("");
      setUrl("");
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-panel space-y-4 p-4 sm:p-5" noValidate>
      <div className="flex items-center gap-2 text-slate-100">
        <PlusCircle className="h-5 w-5 text-cyan-300" />
        <h2 className="text-base font-semibold">Add bookmark</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1.1fr_1.4fr_auto] sm:items-start">
        <div>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            autoComplete="off"
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title ? <p className="mt-1 text-xs text-rose-200">{errors.title}</p> : null}
        </div>

        <div>
          <div className="relative">
            <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="pl-9"
              placeholder="example.com"
              autoComplete="off"
              aria-invalid={Boolean(errors.url)}
            />
          </div>
          {errors.url ? <p className="mt-1 text-xs text-rose-200">{errors.url}</p> : null}
        </div>

        <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
          {isCreating ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
