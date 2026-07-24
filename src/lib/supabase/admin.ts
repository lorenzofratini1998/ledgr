import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

/**
 * Supabase Admin Client.
 * Uses the SERVICE_ROLE_KEY to bypass Row Level Security.
 * WARNING: Never use this client in the browser or for operations
 * where user context is required. Only use it for background jobs,
 * webhooks, or system-level administrative tasks.
 */
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
