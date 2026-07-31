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
