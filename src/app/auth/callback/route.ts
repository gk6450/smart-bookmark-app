import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { AUTH_SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/supabase/shared";

function sanitizeNextPath(path: string | null): string {
  if (!path || !path.startsWith("/")) {
    return "/bookmarks";
  }

  return path;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      const loginUrl = new URL("/login", requestUrl.origin);
      loginUrl.searchParams.set("error", AUTH_SERVICE_UNAVAILABLE_MESSAGE);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
