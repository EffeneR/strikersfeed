-- StrikersFeed — migration 0006: post reactions (likes / reposts / bookmarks)
--
-- One row per (post, user, kind). Denormalised counts on `posts` are kept in
-- sync by a trigger, so the feed reads counts cheaply. RLS lets users manage
-- only their own reactions.
--
-- Run in the Supabase SQL editor. Requires 0001–0005.

-- 1. Count columns on posts ------------------------------------------------
alter table public.posts add column if not exists like_count     int not null default 0;
alter table public.posts add column if not exists repost_count   int not null default 0;
alter table public.posts add column if not exists bookmark_count int not null default 0;

-- 2. Reactions table -------------------------------------------------------
create table if not exists public.post_reactions (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  kind       text not null check (kind in ('like','repost','bookmark')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, kind)
);
create index if not exists post_reactions_user_idx on public.post_reactions (user_id);
create index if not exists post_reactions_post_idx on public.post_reactions (post_id);

alter table public.post_reactions enable row level security;

drop policy if exists "Read own reactions" on public.post_reactions;
create policy "Read own reactions" on public.post_reactions for select
  using (user_id = auth.uid());

drop policy if exists "Add own reactions" on public.post_reactions;
create policy "Add own reactions" on public.post_reactions for insert
  with check (user_id = auth.uid());

drop policy if exists "Remove own reactions" on public.post_reactions;
create policy "Remove own reactions" on public.post_reactions for delete
  using (user_id = auth.uid());

-- 3. Keep denormalised counts in sync --------------------------------------
create or replace function public.handle_reaction_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  delta int;
  target_post uuid;
  target_kind text;
begin
  if tg_op = 'INSERT' then
    delta := 1; target_post := new.post_id; target_kind := new.kind;
  else
    delta := -1; target_post := old.post_id; target_kind := old.kind;
  end if;

  if target_kind = 'like' then
    update public.posts set like_count = greatest(0, like_count + delta) where id = target_post;
  elsif target_kind = 'repost' then
    update public.posts set repost_count = greatest(0, repost_count + delta) where id = target_post;
  elsif target_kind = 'bookmark' then
    update public.posts set bookmark_count = greatest(0, bookmark_count + delta) where id = target_post;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists post_reactions_count on public.post_reactions;
create trigger post_reactions_count
  after insert or delete on public.post_reactions
  for each row execute function public.handle_reaction_count();
