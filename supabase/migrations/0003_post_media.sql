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
