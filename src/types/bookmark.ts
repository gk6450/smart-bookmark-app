import type { Database } from "@/types/supabase";

export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
