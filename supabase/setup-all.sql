-- StrikersFeed — complete backend setup (migrations 0001-0011)
-- ----------------------------------------------------------------
-- Paste this ENTIRE file into the Supabase SQL editor and press Run.
-- It is idempotent (safe to re-run) and creates everything the app
-- needs: profiles, posts, media, reactions, comments, moderation,
-- Steam identity, notifications, plus the post-images + avatars
-- storage buckets and all RLS policies + triggers.
-- Generated from supabase/migrations/*.sql.


-- ================================================================
--  0001_profiles.sql
-- ================================================================
-- StrikersFeed — Phase 2 migration 0001: profiles
--
-- Creates the account-role enum and a `profiles` table linked 1:1 to Supabase
-- auth users, with row-level security and a trigger that auto-creates a profile
-- on sign-up from the metadata sent by `signUpAction` (display_name + role).
--
-- Run this in the Supabase SQL editor, or via `supabase db push` with the CLI.

-- 1. Account role enum (mirrors src/config/accountRoles.ts) ------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_role') then
    create type public.account_role as enum ('player', 'team', 'influencer', 'fan', 'other');
  end if;
end
$$;

-- 2. Profiles table ---------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique,
  display_name text,
  role         public.account_role not null default 'fan',
  avatar_url   text,
  bio          text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3. Row-level security -----------------------------------------------------
alter table public.profiles enable row level security;

-- Profiles are public (needed to render authors/teams/players).
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- A user may create their own profile row.
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- A user may update only their own profile.
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Auto-create a profile on sign-up --------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::public.account_role, 'fan')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Keep updated_at fresh --------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();


-- ================================================================
--  0002_posts.sql
-- ================================================================
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

-- 4. updated_at trigger --------------------------------------------------
-- `handle_updated_at()` is also defined in 0001; (re)defined here so 0002 is
-- self-contained and safe to run even if 0001 was applied without it.
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();


-- ================================================================
--  0003_post_media.sql
-- ================================================================
-- StrikersFeed — migration 0003: post media + image storage (Slice B)
--
-- Adds the post_media table, the `post-images` Storage bucket (public read,
-- images only, 10 MB cap — Supabase enforces MIME + size server-side), and
-- Storage RLS so users can only write inside their own {userId}/ folder.
--
-- Run in the Supabase SQL editor. Requires 0001 + 0002.

-- 1. post_media table ------------------------------------------------------
create table if not exists public.post_media (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid not null references public.posts (id) on delete cascade,
  media_type        text not null default 'IMAGE',      -- IMAGE | VIDEO
  provider          text not null default 'supabase',
  storage_path      text,
  external_uid      text,
  playback_id       text,
  thumbnail_url     text,
  width             int,
  height            int,
  duration_seconds  int,
  processing_status text not null default 'READY',
  alt               text,
  position          int not null default 0,
  created_at        timestamptz not null default now()
);
create index if not exists post_media_post_idx on public.post_media (post_id);

alter table public.post_media enable row level security;

-- Read media when the parent post is readable.
drop policy if exists "Read media of readable posts" on public.post_media;
create policy "Read media of readable posts" on public.post_media for select
  using (exists (
    select 1 from public.posts p
    where p.id = post_id
      and ((p.visibility='PUBLIC' and p.moderation_status='VISIBLE' and p.deleted_at is null)
           or p.author_id = auth.uid())
  ));

-- Insert media only into your own post.
drop policy if exists "Insert media into own posts" on public.post_media;
create policy "Insert media into own posts" on public.post_media for insert
  with check (exists (
    select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()
  ));

-- Delete media of your own post.
drop policy if exists "Delete media of own posts" on public.post_media;
create policy "Delete media of own posts" on public.post_media for delete
  using (exists (
    select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()
  ));

-- 2. Storage bucket for post images ---------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 10485760,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 3. Storage RLS (bucket objects) -----------------------------------------
-- Public read (also served via public URL); write/modify only within your
-- own {userId}/ prefix.
drop policy if exists "post-images public read" on storage.objects;
create policy "post-images public read" on storage.objects for select
  using (bucket_id = 'post-images');

drop policy if exists "post-images insert own" on storage.objects;
create policy "post-images insert own" on storage.objects for insert
  with check (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "post-images update own" on storage.objects;
create policy "post-images update own" on storage.objects for update
  using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "post-images delete own" on storage.objects;
create policy "post-images delete own" on storage.objects for delete
  using (bucket_id = 'post-images' and (storage.foldername(name))[1] = auth.uid()::text);


-- ================================================================
--  0004_post_external_sources.sql
-- ================================================================
-- StrikersFeed — migration 0004: external sources (Slice D, manual Medal posts)
--
-- Stores the original Medal attribution for MEDAL_CLIP posts, and widens the
-- posts insert policy so users can create their own manual Medal posts
-- (source MEDAL_MANUAL). Server-only sources (connected/discovery) stay blocked
-- for direct user insert.
--
-- Run in the Supabase SQL editor. Requires 0001–0003.

-- 1. post_external_sources -------------------------------------------------
create table if not exists public.post_external_sources (
  id                    uuid primary key default gen_random_uuid(),
  post_id               uuid not null references public.posts (id) on delete cascade,
  provider              text not null default 'medal',
  external_id           text,
  external_url          text not null,
  creator_username      text,
  creator_profile_url   text,
  original_published_at timestamptz,
  metadata              jsonb,
  created_at            timestamptz not null default now()
);
create index if not exists post_external_sources_post_idx
  on public.post_external_sources (post_id);

alter table public.post_external_sources enable row level security;

drop policy if exists "Read sources of readable posts" on public.post_external_sources;
create policy "Read sources of readable posts" on public.post_external_sources for select
  using (exists (
    select 1 from public.posts p where p.id = post_id
      and ((p.visibility='PUBLIC' and p.moderation_status='VISIBLE' and p.deleted_at is null)
           or p.author_id = auth.uid())
  ));

drop policy if exists "Insert sources into own posts" on public.post_external_sources;
create policy "Insert sources into own posts" on public.post_external_sources for insert
  with check (exists (
    select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()
  ));

-- 2. Allow users to create their own manual Medal posts --------------------
drop policy if exists "Insert own native posts" on public.posts;
drop policy if exists "Insert own native or manual-medal posts" on public.posts;
create policy "Insert own native or manual-medal posts" on public.posts for insert
  with check (
    author_id = auth.uid()
    and source in ('NATIVE', 'MEDAL_MANUAL')
    and moderation_status = 'VISIBLE'
  );


-- ================================================================
--  0005_external_clips.sql
-- ================================================================
-- StrikersFeed — migration 0005: external clip discovery (Slice F foundation)
--
-- Data model for importing public clips from external platforms (Medal, Twitch)
-- as attributed posts by EXTERNAL creators (never StrikersFeed accounts).
-- Real imports are written by a trusted server process (service role, which
-- bypasses RLS) — regular users cannot create discovery posts.
--
-- Run in the Supabase SQL editor. Requires 0001–0004.

-- 1. External creators (public, for attribution) ---------------------------
create table if not exists public.external_creators (
  id                  uuid primary key default gen_random_uuid(),
  provider            text not null,               -- 'medal' | 'twitch'
  external_creator_id text not null,
  username            text not null,
  display_name        text,
  profile_url         text not null,
  avatar_url          text,
  linked_user_id      uuid references public.profiles (id) on delete set null,
  last_seen_at        timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (provider, external_creator_id)
);
alter table public.external_creators enable row level security;
drop policy if exists "External creators are public" on public.external_creators;
create policy "External creators are public" on public.external_creators for select using (true);

-- 2. External clips (internal — service-role only) -------------------------
create table if not exists public.external_clips (
  id                  uuid primary key default gen_random_uuid(),
  provider            text not null,
  external_clip_id    text not null,
  external_creator_id uuid references public.external_creators (id) on delete set null,
  canonical_url       text not null,
  title               text,
  thumbnail_url       text,
  duration_seconds    int,
  original_published_at timestamptz,
  discovered_at       timestamptz not null default now(),
  availability_status text not null default 'AVAILABLE',
  moderation_status   public.moderation_status not null default 'VISIBLE',
  post_id             uuid references public.posts (id) on delete set null,
  raw_metadata        jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (provider, external_clip_id)          -- idempotent imports
);
create index if not exists external_clips_canonical_idx on public.external_clips (canonical_url);
alter table public.external_clips enable row level security;   -- no policies => service-role only

-- 3. Import jobs + provider cursors (internal) -----------------------------
create table if not exists public.import_jobs (
  id               uuid primary key default gen_random_uuid(),
  provider         text not null,
  status           text not null default 'RUNNING',   -- RUNNING|COMPLETED|PARTIAL|FAILED
  started_at       timestamptz not null default now(),
  completed_at     timestamptz,
  clips_discovered int not null default 0,
  clips_imported   int not null default 0,
  clips_skipped    int not null default 0,
  error_summary    text,
  cursor_before    text,
  cursor_after     text,
  created_at       timestamptz not null default now()
);
alter table public.import_jobs enable row level security;      -- service-role only

create table if not exists public.external_provider_cursors (
  provider   text primary key,
  cursor     text,
  updated_at timestamptz not null default now()
);
alter table public.external_provider_cursors enable row level security; -- service-role only

-- 4. Posts: support external-creator authored posts ------------------------
alter table public.posts alter column author_id drop not null;
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='posts' and column_name='external_creator_id'
  ) then
    alter table public.posts add column external_creator_id uuid;
  end if;
end $$;
do $$ begin
  if not exists (select 1 from pg_constraint where conname='posts_external_creator_fk') then
    alter table public.posts add constraint posts_external_creator_fk
      foreign key (external_creator_id) references public.external_creators (id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname='posts_author_or_external') then
    alter table public.posts add constraint posts_author_or_external
      check (author_id is not null or external_creator_id is not null);
  end if;
end $$;

-- Public read policy already covers PUBLIC+VISIBLE posts regardless of author,
-- so external-creator posts are readable without further policy changes.


-- ================================================================
--  0006_post_reactions.sql
-- ================================================================
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


-- ================================================================
--  0007_comments.sql
-- ================================================================
-- StrikersFeed — migration 0007: comments (replies)
--
-- Threaded replies on posts. `posts.comment_count` is kept in sync by a trigger.
-- RLS: anyone can read replies on public+visible posts; users write/delete only
-- their own.
--
-- Run in the Supabase SQL editor. Requires 0001–0006.

alter table public.posts add column if not exists comment_count int not null default 0;

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "Read comments on readable posts" on public.comments;
create policy "Read comments on readable posts" on public.comments for select
  using (exists (
    select 1 from public.posts p where p.id = post_id
      and ((p.visibility='PUBLIC' and p.moderation_status='VISIBLE' and p.deleted_at is null)
           or p.author_id = auth.uid())
  ));

drop policy if exists "Add own comments" on public.comments;
create policy "Add own comments" on public.comments for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.posts p where p.id = post_id
        and p.visibility='PUBLIC' and p.moderation_status='VISIBLE' and p.deleted_at is null
    )
  );

drop policy if exists "Delete own comments" on public.comments;
create policy "Delete own comments" on public.comments for delete
  using (author_id = auth.uid());

drop trigger if exists comments_updated_at on public.comments;
create trigger comments_updated_at before update on public.comments
  for each row execute function public.handle_updated_at();

-- Keep posts.comment_count in sync.
create or replace function public.handle_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set comment_count = greatest(0, comment_count - 1) where id = old.post_id;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists comments_count on public.comments;
create trigger comments_count
  after insert or delete on public.comments
  for each row execute function public.handle_comment_count();


-- ================================================================
--  0008_avatars.sql
-- ================================================================
-- StrikersFeed — migration 0008: avatar storage
--
-- Public `avatars` bucket for profile pictures (images only, 2 MB). Users write
-- only inside their own {userId}/ folder. Profile fields (display_name, bio,
-- username, avatar_url) already exist on `profiles` from 0001 — no table change.
--
-- Run in the Supabase SQL editor. Requires 0001.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars insert own" on storage.objects;
create policy "avatars insert own" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars update own" on storage.objects;
create policy "avatars update own" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars delete own" on storage.objects;
create policy "avatars delete own" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);


-- ================================================================
--  0009_steam_identity.sql
-- ================================================================
-- StrikersFeed — migration 0009: Steam identity & verification
--
-- Adds Steam linkage + a verification tier to profiles, and a service-role-only
-- table of pending profile-code challenges. Verification/steam columns are NOT
-- user-writable (column privilege revoked) — only SECURITY DEFINER / service-role
-- code (the Steam login bridge + verification actions) may set them.
--
-- Run in the Supabase SQL editor. Requires 0001.

-- 1. Verification tier enum -------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'verification_status') then
    create type public.verification_status as enum ('none', 'steam_verified', 'pro_verified');
  end if;
end $$;

-- 2. Profile columns --------------------------------------------------------
alter table public.profiles add column if not exists steam_id text unique;
alter table public.profiles add column if not exists steam_persona text;
alter table public.profiles add column if not exists steam_avatar_url text;
alter table public.profiles add column if not exists verification_status public.verification_status not null default 'none';
alter table public.profiles add column if not exists verified_at timestamptz;

-- Users may edit their own profile (0001) but NOT the identity/verification
-- columns — those are set only by trusted server code (service role bypasses
-- column privileges).
revoke update (steam_id, steam_persona, steam_avatar_url, verification_status, verified_at)
  on public.profiles from authenticated, anon;

-- 3. Pending profile-code challenges (service-role only) --------------------
create table if not exists public.steam_verifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  steam_id     text not null,
  persona      text,
  avatar_url   text,
  code         text not null,
  method       text not null default 'profile_code',
  expires_at   timestamptz not null,
  consumed_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists steam_verifications_user_idx on public.steam_verifications (user_id);

-- RLS enabled with no policies => only the service role can read/write these.
alter table public.steam_verifications enable row level security;


-- ================================================================
--  0010_moderation.sql
-- ================================================================
-- StrikersFeed — migration 0010: moderation (reports + blocking)
--
-- Adds the two pieces every UGC app needs before an app store will accept it:
--   1. content_reports — users flag posts / comments / profiles / clips.
--   2. blocked_users   — users hide another account's content from themselves.
--
-- Reports have real teeth: once a post crosses a small distinct-reporter
-- threshold it is auto-moved to `HIDDEN` (the existing posts RLS already hides
-- anything whose moderation_status <> 'VISIBLE'), pending human review. Admins
-- (service_role) read the full reports queue; regular users only see their own.
--
-- Run in the Supabase SQL editor. Requires 0001–0002 (profiles + posts).

-- 1. content_reports -------------------------------------------------------
create table if not exists public.content_reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('post','comment','profile','clip')),
  target_id   text not null,
  reason      text not null check (reason in (
                'spam','harassment','hate','violence','sexual','self_harm',
                'misinformation','impersonation','misattribution','off_topic','other')),
  details     text check (char_length(details) <= 1000),
  status      text not null default 'pending'
                check (status in ('pending','reviewing','actioned','dismissed')),
  created_at  timestamptz not null default now(),
  -- one report per user per target keeps the auto-hide count honest.
  unique (reporter_id, target_type, target_id)
);
create index if not exists content_reports_triage_idx
  on public.content_reports (status, created_at desc);
create index if not exists content_reports_target_idx
  on public.content_reports (target_type, target_id);

alter table public.content_reports enable row level security;

-- Users may file a report as themselves.
drop policy if exists "File own reports" on public.content_reports;
create policy "File own reports" on public.content_reports for insert
  with check (reporter_id = auth.uid());

-- Users may read only the reports they filed (moderators use service_role).
drop policy if exists "Read own reports" on public.content_reports;
create policy "Read own reports" on public.content_reports for select
  using (reporter_id = auth.uid());

-- 2. blocked_users ---------------------------------------------------------
create table if not exists public.blocked_users (
  id         uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index if not exists blocked_users_blocker_idx on public.blocked_users (blocker_id);

alter table public.blocked_users enable row level security;

drop policy if exists "Read own blocks" on public.blocked_users;
create policy "Read own blocks" on public.blocked_users for select
  using (blocker_id = auth.uid());

drop policy if exists "Add own blocks" on public.blocked_users;
create policy "Add own blocks" on public.blocked_users for insert
  with check (blocker_id = auth.uid());

drop policy if exists "Remove own blocks" on public.blocked_users;
create policy "Remove own blocks" on public.blocked_users for delete
  using (blocker_id = auth.uid());

-- 3. Auto-hide heavily-reported posts --------------------------------------
-- When a post collects reports from >= this many distinct accounts, hide it
-- until a moderator reviews. Only escalates VISIBLE -> HIDDEN, never touches
-- posts an admin has already actioned (REMOVED) or restored.
create or replace function public.handle_report_autohide()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  report_count int;
  threshold constant int := 3;
begin
  if new.target_type = 'post' then
    select count(*) into report_count
      from public.content_reports
      where target_type = 'post' and target_id = new.target_id;

    if report_count >= threshold then
      update public.posts
        set moderation_status = 'HIDDEN'
        where id = new.target_id::uuid
          and moderation_status = 'VISIBLE';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists content_reports_autohide on public.content_reports;
create trigger content_reports_autohide
  after insert on public.content_reports
  for each row execute function public.handle_report_autohide();


-- ================================================================
--  0011_device_tokens.sql
-- ================================================================
-- StrikersFeed — migration 0011: push notification device tokens + preferences
--
-- Stores Expo push tokens per signed-in device so the backend can send push
-- notifications (match alerts, mentions, replies) to the mobile app, plus a
-- per-user preferences row so users control what they receive. Web ignores this.
--
-- Run in the Supabase SQL editor. Requires 0001 (profiles).

-- 1. device_tokens ---------------------------------------------------------
create table if not exists public.device_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  token      text not null,
  platform   text not null check (platform in ('ios','android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- one row per physical device token; re-registering upserts.
  unique (token)
);
create index if not exists device_tokens_user_idx on public.device_tokens (user_id);

alter table public.device_tokens enable row level security;

drop policy if exists "Read own device tokens" on public.device_tokens;
create policy "Read own device tokens" on public.device_tokens for select
  using (user_id = auth.uid());

drop policy if exists "Add own device tokens" on public.device_tokens;
create policy "Add own device tokens" on public.device_tokens for insert
  with check (user_id = auth.uid());

drop policy if exists "Update own device tokens" on public.device_tokens;
create policy "Update own device tokens" on public.device_tokens for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Remove own device tokens" on public.device_tokens;
create policy "Remove own device tokens" on public.device_tokens for delete
  using (user_id = auth.uid());

-- 2. notification_prefs (one row per user) ---------------------------------
create table if not exists public.notification_prefs (
  user_id     uuid primary key references public.profiles (id) on delete cascade,
  match_start boolean not null default true,
  mentions    boolean not null default true,
  replies     boolean not null default true,
  follows     boolean not null default true,
  updated_at  timestamptz not null default now()
);

alter table public.notification_prefs enable row level security;

drop policy if exists "Read own notification prefs" on public.notification_prefs;
create policy "Read own notification prefs" on public.notification_prefs for select
  using (user_id = auth.uid());

drop policy if exists "Upsert own notification prefs" on public.notification_prefs;
create policy "Upsert own notification prefs" on public.notification_prefs for insert
  with check (user_id = auth.uid());

drop policy if exists "Update own notification prefs" on public.notification_prefs;
create policy "Update own notification prefs" on public.notification_prefs for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 3. keep updated_at fresh -------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists device_tokens_touch on public.device_tokens;
create trigger device_tokens_touch before update on public.device_tokens
  for each row execute function public.touch_updated_at();

drop trigger if exists notification_prefs_touch on public.notification_prefs;
create trigger notification_prefs_touch before update on public.notification_prefs
  for each row execute function public.touch_updated_at();

