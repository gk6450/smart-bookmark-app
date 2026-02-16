import { LogOut, Sparkles } from "lucide-react";

import { signOutAction } from "@/features/auth/actions";

import { Button } from "../ui/button";

type AppShellProps = {
  userEmail: string;
  children: React.ReactNode;
};

export function AppShell({ userEmail, children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(34,211,238,0.24),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(56,189,248,0.22),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(148,163,184,0.18),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_0%,transparent_30%,rgba(255,255,255,0.03)_100%)]" />

      <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="glass-panel flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/85">Smart Bookmark App</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-50 sm:text-3xl">
              <Sparkles className="h-6 w-6 text-cyan-300" />
              Personal Bookmark Vault
            </h1>
            <p className="mt-1 text-sm text-slate-300">Signed in as {userEmail}</p>
          </div>

          <form action={signOutAction}>
            <Button variant="secondary" size="sm" type="submit" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </header>

        {children}
      </main>
    </div>
  );
}
