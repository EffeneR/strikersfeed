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
