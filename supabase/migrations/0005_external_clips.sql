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
