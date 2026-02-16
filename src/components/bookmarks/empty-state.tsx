import { BookmarkX } from "lucide-react";

export function EmptyState() {
  return (
    <div className="glass-panel flex flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="rounded-full border border-white/20 bg-white/10 p-3">
        <BookmarkX className="h-7 w-7 text-cyan-200" />
      </div>
      <h3 className="text-lg font-semibold text-slate-50">No bookmarks yet</h3>
      <p className="max-w-sm text-sm text-slate-300">
        Add your first link and it will appear instantly across your open tabs.
      </p>
    </div>
  );
}
