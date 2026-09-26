-- Customer webhooks: one endpoint per account, signed with a per-account secret.
alter table public.profiles
  add column if not exists webhook_url text,
  add column if not exists webhook_secret text,
  add column if not exists webhook_last_status integer,
  add column if not exists webhook_last_at timestamptz;
