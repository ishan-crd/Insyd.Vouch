// Literal `process.env.NEXT_PUBLIC_*` reads so Next.js can inline them into browser and proxy bundles.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function publicSupabaseEnv() {
  if (!url || !publishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. See .env.example.");
  }
  return { url, publishableKey };
}
