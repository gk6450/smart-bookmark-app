import { BookmarkSkeleton } from "@/components/bookmarks/bookmark-skeleton";

export default function LoadingBookmarksPage() {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.16),transparent_24%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="glass-panel p-5">
          <div className="h-6 w-56 rounded bg-white/15" />
          <div className="mt-3 h-4 w-72 rounded bg-white/10" />
        </section>

        <section className="glass-panel p-4 sm:p-5">
          <div className="h-5 w-32 rounded bg-white/15" />
          <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr_1.4fr_auto]">
            <div className="h-11 rounded-xl bg-white/10" />
            <div className="h-11 rounded-xl bg-white/10" />
            <div className="h-11 rounded-xl bg-white/15" />
          </div>
        </section>

        <div className="grid gap-3">
          <BookmarkSkeleton />
          <BookmarkSkeleton />
          <BookmarkSkeleton />
        </div>
      </div>
    </div>
  );
}
