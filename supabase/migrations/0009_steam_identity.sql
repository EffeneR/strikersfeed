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
