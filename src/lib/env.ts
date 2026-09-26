function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return value;
}

export const env = {
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabasePublishableKey: () => required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  supabaseSecretKey: () => required("SUPABASE_SECRET_KEY"),
  apifyToken: () => required("APIFY_TOKEN"),
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100",
  webhookSecret: () => required("WEBHOOK_SECRET"),
  cronSecret: () => required("CRON_SECRET"),
};
