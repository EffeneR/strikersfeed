-- StrikersFeed — migration 0012: follows (social graph)
--
-- One row per (follower, followee). Denormalised follower_count/following_count
-- on profiles kept in sync by a trigger, so counts read cheaply. RLS lets anyone
-- read the graph but only manage their own follows.
--
-- Run in the Supabase SQL editor. Requires 0001 (profiles).

-- 1. Counts on profiles -----------------------------------------------------
alter table public.profiles add column if not exists follower_count  int not null default 0;
alter table public.profiles add column if not exists following_count int not null default 0;

-- 2. follows table ----------------------------------------------------------
create table if not exists public.follows (
  id          uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index if not exists follows_follower_idx on public.follows (follower_id);
create index if not exists follows_followee_idx on public.follows (followee_id);

alter table public.follows enable row level security;

drop policy if exists "Read follows" on public.follows;
create policy "Read follows" on public.follows for select using (true);

drop policy if exists "Follow as self" on public.follows;
create policy "Follow as self" on public.follows for insert
  with check (follower_id = auth.uid());

drop policy if exists "Unfollow own" on public.follows;
create policy "Unfollow own" on public.follows for delete
  using (follower_id = auth.uid());

-- 3. Keep denormalised counts in sync --------------------------------------
create or replace function public.handle_follow_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set follower_count  = follower_count  + 1 where id = new.followee_id;
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
  elsif tg_op = 'DELETE' then
    update public.profiles set follower_count  = greatest(0, follower_count  - 1) where id = old.followee_id;
    update public.profiles set following_count = greatest(0, following_count - 1) where id = old.follower_id;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists follows_count on public.follows;
create trigger follows_count
  after insert or delete on public.follows
  for each row execute function public.handle_follow_count();
