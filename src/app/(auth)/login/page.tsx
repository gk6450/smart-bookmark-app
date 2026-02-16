import { Chrome } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signInWithGoogleAction } from "@/features/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/bookmarks");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.24),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.2),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(148,163,184,0.14),transparent_45%)]" />

      <section className="glass-panel relative w-full max-w-md space-y-6 p-6 sm:p-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-50">Smart Bookmark App</h1>
          <p className="text-sm text-slate-300">Sign in with Google to manage your private bookmarks.</p>
        </header>

        {params.error ? (
          <div className="rounded-xl border border-rose-300/40 bg-rose-300/12 px-3 py-2 text-sm text-rose-100">
            {decodeURIComponent(params.error)}
          </div>
        ) : null}

        <form action={signInWithGoogleAction}>
          <Button type="submit" className="h-11 w-full justify-center gap-2 text-base">
            <Chrome className="h-4 w-4" />
            Continue with Google
          </Button>
        </form>
      </section>
    </main>
  );
}
