-- ------------------------------------------------------------
-- Database setup for the Calorie Tracker sync
--
-- Run this ONCE in Supabase: SQL Editor → New query → paste → Run.
--
-- One table holds all records (food, exercise, weight, favourites,
-- settings). Row Level Security makes sure every account can only
-- read and change its own rows.
-- ------------------------------------------------------------

create table if not exists public.items (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  kind text not null,                 -- entry | weight | favorite | settings
  data jsonb,                         -- the record itself
  deleted boolean not null default false,
  updated_at timestamptz not null,    -- when it was changed on the device
  server_updated_at timestamptz not null default clock_timestamp(),
  primary key (user_id, id)
);

create index if not exists items_user_server_time on public.items (user_id, server_updated_at);

-- The server notes when each row arrived, so devices can ask
-- "what changed since last time?"
create or replace function public.items_set_server_time()
returns trigger language plpgsql as $$
begin
  new.server_updated_at = clock_timestamp();
  return new;
end;
$$;

drop trigger if exists items_server_time on public.items;
create trigger items_server_time
  before insert or update on public.items
  for each row execute function public.items_set_server_time();

-- Only you can see and change your own data
alter table public.items enable row level security;

drop policy if exists "own rows: read" on public.items;
drop policy if exists "own rows: add" on public.items;
drop policy if exists "own rows: change" on public.items;
drop policy if exists "own rows: delete" on public.items;

create policy "own rows: read"   on public.items for select using (auth.uid() = user_id);
create policy "own rows: add"    on public.items for insert with check (auth.uid() = user_id);
create policy "own rows: change" on public.items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows: delete" on public.items for delete using (auth.uid() = user_id);
