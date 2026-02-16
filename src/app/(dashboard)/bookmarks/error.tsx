"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-8">
      <div className="relative mx-auto flex w-full max-w-3xl items-center justify-center">
        <div className="glass-panel w-full space-y-3 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-rose-200" />
          <h2 className="text-xl font-semibold text-slate-50">Something went wrong</h2>
          <p className="text-sm text-slate-300">{error.message || "Unable to load bookmarks."}</p>
          <Button type="button" onClick={reset} className="mx-auto">
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
