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
