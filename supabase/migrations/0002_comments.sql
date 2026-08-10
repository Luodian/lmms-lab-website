-- ============================================================================
-- 0002_comments.sql
-- Public comments on blog posts and notes for the LMMs-Lab website.
--
-- Creates: comments, with row level security and an updated_at trigger.
-- Comments attach to an entry by (kind, slug) rather than an entries.id
-- foreign key so one table serves database entries and git-tracked MDX
-- pages alike.
--
-- Depends on 0001_blog_system.sql for public.profiles, the
-- public.set_updated_at() trigger function, and public.get_user_role().
--
-- Safe to re-run: uses IF NOT EXISTS / DROP IF EXISTS where Postgres
-- supports it. Runs as-is in the Supabase SQL Editor or via
-- `supabase db push`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- comments: one row per comment, tied to its author's profile.
-- ----------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('post', 'note')),
  slug text not null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Serves the per-entry comment list.
create index if not exists comments_kind_slug_created_at_idx
on public.comments (kind, slug, created_at desc);

-- Supports author lookups and the cascade from profiles.
create index if not exists comments_author_id_idx
on public.comments (author_id);

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

-- Comments RLS.
alter table public.comments enable row level security;

-- Comments are public, like the published entries they attach to.
drop policy if exists comments_select on public.comments;
create policy comments_select
on public.comments
for select
to anon, authenticated
using (true);

drop policy if exists comments_insert_own on public.comments;
create policy comments_insert_own
on public.comments
for insert
to authenticated
with check (author_id = (select auth.uid()));

-- USING pins the old row to the caller and WITH CHECK pins the new row to
-- the same uid, so an update can never reassign author_id.
drop policy if exists comments_update_own on public.comments;
create policy comments_update_own
on public.comments
for update
to authenticated
using (author_id = (select auth.uid()))
with check (author_id = (select auth.uid()));

-- Authors moderate their own comments; admins moderate everything.
drop policy if exists comments_delete on public.comments;
create policy comments_delete
on public.comments
for delete
to authenticated
using (
  author_id = (select auth.uid())
  or (select public.get_user_role()) = 'admin'
);
