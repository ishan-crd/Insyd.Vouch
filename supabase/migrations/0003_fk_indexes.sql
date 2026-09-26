-- Cover foreign keys used by cascading deletes.
create index if not exists run_items_user_idx on public.run_items (user_id);
create index if not exists snapshots_run_idx on public.snapshots (run_id);
create index if not exists snapshots_user_idx on public.snapshots (user_id);
comment on table public.jobs is 'Upstream scraper runs. Service role only: RLS on with no policies on purpose.';
