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
