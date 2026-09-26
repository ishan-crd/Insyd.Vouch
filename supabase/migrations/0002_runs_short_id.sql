-- Short, human-friendly run id for search and display.
alter table public.runs add column if not exists short_id text generated always as (left(id::text, 8)) stored;
create index if not exists runs_user_short_idx on public.runs (user_id, short_id);
