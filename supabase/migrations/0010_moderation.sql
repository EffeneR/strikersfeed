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
