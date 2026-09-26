import { createBrowserClient } from "@supabase/ssr";
import { publicSupabaseEnv } from "./public-env";

export function createClient() {
  const { url, publishableKey } = publicSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
