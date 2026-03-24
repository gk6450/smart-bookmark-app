"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { AUTH_SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/supabase/shared";

function removeTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function getBaseUrl(headerStore: Headers): string {
  const forwardedHost = headerStore.get("x-forwarded-host");
  const forwardedProto = headerStore.get("x-forwarded-proto") ?? "https";
  const origin = headerStore.get("origin");

  if (forwardedHost) {
    return removeTrailingSlash(`${forwardedProto}://${forwardedHost}`);
  }

  if (origin) {
    return removeTrailingSlash(origin);
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return removeTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  }

  return "http://localhost:3000";
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const headerStore = await headers();
  const baseUrl = getBaseUrl(headerStore);

  let data;
  let error;

  try {
    ({ data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${baseUrl}/auth/callback?next=/bookmarks`,
      },
    }));
  } catch {
    redirect(`/login?error=${encodeURIComponent(AUTH_SERVICE_UNAVAILABLE_MESSAGE)}`);
  }

  if (error || !data.url) {
    const message = encodeURIComponent(error?.message ?? "Google sign in failed.");
    redirect(`/login?error=${message}`);
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();

  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore upstream auth outages and continue the local redirect.
  }

  redirect("/login");
}
