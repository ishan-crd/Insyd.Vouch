import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { env } from "@/lib/env";

let client: ReturnType<typeof createClient<Database>> | undefined;

/** Service-role client. Bypasses RLS, so every query must be scoped by user_id explicitly. */
export function admin() {
  client ??= createClient<Database>(env.supabaseUrl(), env.supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
