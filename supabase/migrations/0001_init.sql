-- Vouch schema.
-- A "job" is one upstream scraper run. A "run" is what a customer sees and pays for: it belongs to one user and
-- points at one job. Scheduled tracking batches many users' posts into a single job, so one job can back many runs.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------ profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  company text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, company)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'company'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------ api keys
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  prefix text not null,               -- first characters, shown in the UI ("vch_live_ab12…")
  key_hash text not null unique,      -- sha256 of the full key; the key itself is never stored
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
create index if not exists api_keys_user_idx on public.api_keys (user_id);

-- ------------------------------------------------------------------ upstream jobs
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  upstream_run_id text unique,
  upstream_dataset_id text,
  status text not null default 'READY',
  kind text not null check (kind in ('ONE_OFF', 'SCHEDULE')),
  input jsonb not null,
  status_message text,
  item_count integer not null default 0,
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  processed_at timestamptz            -- set once results were distributed to runs
);
create index if not exists jobs_open_idx on public.jobs (created_at) where processed_at is null;

-- ------------------------------------------------------------------ runs (customer facing)
create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  status text not null default 'READY'
    check (status in ('READY', 'RUNNING', 'SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT')),
  origin text not null check (origin in ('WEB', 'API', 'SCHEDULE')),
  input jsonb not null,
  targets text[] not null default '{}', -- normalised inputs this run is responsible for
  result_count integer not null default 0,
  cost_usd numeric(12, 4) not null default 0,
  status_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists runs_user_started_idx on public.runs (user_id, started_at desc);
create index if not exists runs_job_idx on public.runs (job_id);

create table if not exists public.run_items (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.runs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  position integer not null,
  short_code text,
  data jsonb not null
);
create index if not exists run_items_run_idx on public.run_items (run_id, position);

-- ------------------------------------------------------------------ tracking
create table if not exists public.tracked_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  url text not null,
  short_code text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'ended', 'error')),
  interval_minutes integer not null default 120,
  include_shares boolean not null default false,
  next_check_at timestamptz not null default now(),
  last_checked_at timestamptz,
  ends_at timestamptz,
  owner_username text,
  caption text,
  display_url text,
  product_type text,
  views bigint,
  plays bigint,
  likes bigint,
  comments bigint,
  shares bigint,
  snapshot_count integer not null default 0,
  latest jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, short_code)
);
create index if not exists tracked_due_idx on public.tracked_posts (next_check_at) where status = 'active';

create table if not exists public.snapshots (
  id bigint generated always as identity primary key,
  tracked_post_id uuid not null references public.tracked_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  run_id uuid references public.runs (id) on delete set null,
  taken_at timestamptz not null default now(),
  views bigint,
  plays bigint,
  likes bigint,
  comments bigint,
  shares bigint,
  data jsonb not null
);
create index if not exists snapshots_post_idx on public.snapshots (tracked_post_id, taken_at);

-- ------------------------------------------------------------------ row level security
-- The server talks to the database with the service role and scopes every query by user_id.
-- RLS still guards anything reached with a user's own session.
alter table public.profiles enable row level security;
alter table public.api_keys enable row level security;
alter table public.jobs enable row level security;
alter table public.runs enable row level security;
alter table public.run_items enable row level security;
alter table public.tracked_posts enable row level security;
alter table public.snapshots enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select using ((select auth.uid()) = id);
drop policy if exists "own keys" on public.api_keys;
create policy "own keys" on public.api_keys for select using ((select auth.uid()) = user_id);
drop policy if exists "own runs" on public.runs;
create policy "own runs" on public.runs for select using ((select auth.uid()) = user_id);
drop policy if exists "own items" on public.run_items;
create policy "own items" on public.run_items for select using ((select auth.uid()) = user_id);
drop policy if exists "own tracked" on public.tracked_posts;
create policy "own tracked" on public.tracked_posts for select using ((select auth.uid()) = user_id);
drop policy if exists "own snapshots" on public.snapshots;
create policy "own snapshots" on public.snapshots for select using ((select auth.uid()) = user_id);
-- jobs: no policies, service role only.

-- The signup trigger function is only meant to be called by the trigger itself.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
