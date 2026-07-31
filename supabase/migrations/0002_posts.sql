-- StrikersFeed — migration 0002: posts (Slice A, native text posts)
--
-- Real database-backed posts with row-level security. Slice A only writes TEXT
-- / NATIVE / PUBLIC / VISIBLE rows, but the enums carry all future values so
-- later slices (image, video, Medal) don't need to alter them.
--
-- Run in the Supabase SQL editor (or `supabase db push`). Requires 0001_profiles.

-- 1. Enums -----------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname='post_type') then
    create type public.post_type as enum
      ('TEXT','IMAGE','VIDEO','MEDAL_CLIP','MATCH','TOURNAMENT','RECRUITMENT','TEAM_UPDATE');
  end if;
  if not exists (select 1 from pg_type where typname='post_source') then
    create type public.post_source as enum
      ('NATIVE','MEDAL_MANUAL','MEDAL_CONNECTED_PROFILE','MEDAL_PUBLIC_DISCOVERY');
  end if;
  if not exists (select 1 from pg_type where typname='post_visibility') then
    create type public.post_visibility as enum
      ('PUBLIC','FOLLOWERS','TEAM_ONLY','UNLISTED');
  end if;
  if not exists (select 1 from pg_type where typname='moderation_status') then
    create type public.moderation_status as enum
      ('PENDING','VISIBLE','HIDDEN','REMOVED');
  end if;
end $$;

-- 2. posts table -----------------------------------------------------------
create table if not exists public.posts (
  id                    uuid primary key default gen_random_uuid(),
  author_id             uuid not null references public.profiles (id) on delete cascade,
  external_creator_id   uuid,                    -- reserved for Medal slices
  type                  public.post_type       not null default 'TEXT',
  source                public.post_source     not null default 'NATIVE',
  body                  text                   not null default '',
  visibility            public.post_visibility not null default 'PUBLIC',
  moderation_status     public.moderation_status not null default 'VISIBLE',
  attached_match_id     text,
  attached_team_id      text,
  attached_tournament_id text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);

create index if not exists posts_feed_idx
  on public.posts (created_at desc)
  where deleted_at is null;
create index if not exists posts_author_idx on public.posts (author_id);

-- 3. Row-level security ----------------------------------------------------
alter table public.posts enable row level security;

-- Public may read only live public+visible posts; owners always see their own.
drop policy if exists "Read public or own posts" on public.posts;
create policy "Read public or own posts"
  on public.posts for select
  using (
    (visibility = 'PUBLIC' and moderation_status = 'VISIBLE' and deleted_at is null)
    or author_id = auth.uid()
  );

-- Users may create posts only as themselves, only NATIVE + VISIBLE.
drop policy if exists "Insert own native posts" on public.posts;
create policy "Insert own native posts"
  on public.posts for insert
  with check (
    author_id = auth.uid()
    and source = 'NATIVE'
    and moderation_status = 'VISIBLE'
  );

-- Users may update/soft-delete only their own posts (incl. setting deleted_at).
drop policy if exists "Update own posts" on public.posts;
create policy "Update own posts"
  on public.posts for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- 4. updated_at trigger (reuses handle_updated_at from 0001) ---------------
drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();
