-- StrikersFeed — migration 0013: notifications
--
-- A real notifications feed populated by triggers when someone replies to your
-- post, likes your post, or follows you. Self-actions are skipped. Rows are
-- inserted by SECURITY DEFINER triggers (not clients); users may only read and
-- mark-read their own. A Supabase Database Webhook on INSERT can fan these out
-- to push via the `send-push` edge function.
--
-- Run in the Supabase SQL editor. Requires 0002 (posts), 0006 (post_reactions),
-- 0007 (comments), 0012 (follows).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum ('reply', 'reaction', 'follow');
  end if;
end $$;

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,  -- recipient
  actor_id   uuid references public.profiles (id) on delete cascade,           -- who acted
  type       public.notification_type not null,
  post_id    uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- Recipients read + mark-read their own; inserts come only from the triggers.
drop policy if exists "Read own notifications" on public.notifications;
create policy "Read own notifications" on public.notifications for select
  using (user_id = auth.uid());

drop policy if exists "Update own notifications" on public.notifications;
create policy "Update own notifications" on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reply → notify the post author
create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare recipient uuid;
begin
  select author_id into recipient from public.posts where id = new.post_id;
  if recipient is not null and recipient <> new.author_id then
    insert into public.notifications (user_id, actor_id, type, post_id, comment_id)
    values (recipient, new.author_id, 'reply', new.post_id, new.id);
  end if;
  return new;
end; $$;
drop trigger if exists comments_notify on public.comments;
create trigger comments_notify after insert on public.comments
  for each row execute function public.notify_on_comment();

-- like → notify the post author (only likes, not reposts/bookmarks)
create or replace function public.notify_on_reaction()
returns trigger language plpgsql security definer set search_path = public as $$
declare recipient uuid;
begin
  if new.kind <> 'like' then return new; end if;
  select author_id into recipient from public.posts where id = new.post_id;
  if recipient is not null and recipient <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (recipient, new.user_id, 'reaction', new.post_id);
  end if;
  return new;
end; $$;
drop trigger if exists reactions_notify on public.post_reactions;
create trigger reactions_notify after insert on public.post_reactions
  for each row execute function public.notify_on_reaction();

-- follow → notify the followee
create or replace function public.notify_on_follow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, actor_id, type)
  values (new.followee_id, new.follower_id, 'follow');
  return new;
end; $$;
drop trigger if exists follows_notify on public.follows;
create trigger follows_notify after insert on public.follows
  for each row execute function public.notify_on_follow();
