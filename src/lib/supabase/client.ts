import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnvironment } from "@/lib/supabase/shared";
import type { Database } from "@/types/supabase";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseEnvironment();
  browserClient = createBrowserClient<Database>(url, anonKey);

  return browserClient;
}
