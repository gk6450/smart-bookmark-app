import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  createSupabaseFetchWithTimeout,
  getSupabaseEnvironment,
} from "@/lib/supabase/shared";
import type { Database } from "@/types/supabase";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnvironment();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignored in Server Components where cookies are read-only.
        }
      },
    },
    global: {
      fetch: createSupabaseFetchWithTimeout(),
    },
  });
}
