-- ============================================================================
-- 0001_blog_system.sql
-- Community blog system for the LMMs-Lab website.
--
-- Creates: profiles, entries, subscriptions, collab_requests, with row level
-- security, an auth.users -> profiles sync trigger, updated_at triggers, a
-- publish-timestamp trigger, a role helper, and admin RPCs for collaboration
-- requests.
--
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP IF EXISTS where
-- Postgres supports it. Runs as-is in the Supabase SQL Editor or via
-- `supabase db push`.
--
-- gen_random_uuid() is built into Postgres 13+, so no extension is required.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Shared trigger function: keep updated_at fresh on every UPDATE.
-- Reused by profiles, entries, and subscriptions.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles: one row per auth user, created by a trigger on auth.users.
-- Public-safe by design: no email is stored here.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  website text,
  role text not null default 'reader' check (role in ('reader', 'editor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Create the profile row when a user signs up. SECURITY DEFINER because the
-- signup runs as the auth service and there is no INSERT policy on profiles
-- (profile rows are trigger-managed).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_display_name text;
begin
  v_display_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'user_name', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), '')
  );

  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    v_display_name,
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Role helper. Named get_user_role because current_role is reserved in SQL.
-- SECURITY DEFINER so it reads profiles without recursing through RLS, and
-- STABLE so policies can evaluate it once per statement. Null-safe: anonymous
-- visitors and users without a profile row count as 'reader'.
-- ----------------------------------------------------------------------------
create or replace function public.get_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.role from public.profiles p where p.id = auth.uid()),
    'reader'
  );
$$;

-- The RLS policies below call this for both anon and authenticated requests.
grant execute on function public.get_user_role() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- Guard: only admins may change profiles.role.
-- auth.uid() IS NULL means the statement did not come through a user request
-- (SQL Editor as postgres, or the service_role key); those trusted paths are
-- allowed, which is what lets the admin bootstrap snippet at the bottom of
-- this file work. End-user requests always carry a non-null auth.uid(), and
-- anonymous requests cannot pass the UPDATE policies to reach this trigger.
-- ----------------------------------------------------------------------------
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is not null and public.get_user_role() <> 'admin' then
      raise exception 'only admins can change roles'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
before update on public.profiles
for each row execute function public.protect_profile_role();

-- Profiles RLS.
alter table public.profiles enable row level security;

-- Everyone can read profiles: they power public author bylines.
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
on public.profiles
for update
to authenticated
using ((select public.get_user_role()) = 'admin')
with check ((select public.get_user_role()) = 'admin');

-- No INSERT or DELETE policies on purpose: rows are created by the
-- on_auth_user_created trigger and removed by the cascade from auth.users.

-- ----------------------------------------------------------------------------
-- entries: community posts and notes.
-- ----------------------------------------------------------------------------
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('post', 'note')),
  slug text not null,
  title text not null,
  description text,
  content text not null default '',
  tags text[] not null default '{}',
  main_tags text[] not null default '{}',
  thumbnail text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid not null references public.profiles (id) on delete cascade,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entries_kind_slug_key unique (kind, slug),
  -- 3-100 chars of lowercase alphanumerics plus '.', '_', '-'; must start and
  -- end with an alphanumeric so slugs like '..' can never appear in a URL.
  constraint entries_slug_format check (slug ~ '^[a-z0-9][a-z0-9._-]{1,98}[a-z0-9]$')
);

create index if not exists entries_kind_status_published_at_idx
on public.entries (kind, status, published_at desc);

-- Supports author dashboards and the cascade from profiles.
create index if not exists entries_author_id_idx
on public.entries (author_id);

drop trigger if exists entries_set_updated_at on public.entries;
create trigger entries_set_updated_at
before update on public.entries
for each row execute function public.set_updated_at();

-- Stamp published_at the first time an entry transitions to 'published'.
-- An existing published_at is kept, so unpublish/republish keeps the
-- original publication date.
create or replace function public.set_entry_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    if tg_op = 'INSERT' then
      new.published_at := now();
    elsif old.status is distinct from 'published' then
      new.published_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists entries_set_published_at on public.entries;
create trigger entries_set_published_at
before insert or update on public.entries
for each row execute function public.set_entry_published_at();

-- Entries RLS.
alter table public.entries enable row level security;

drop policy if exists entries_select on public.entries;
create policy entries_select
on public.entries
for select
to anon, authenticated
using (
  status = 'published'
  or author_id = (select auth.uid())
  or (select public.get_user_role()) = 'admin'
);

drop policy if exists entries_insert on public.entries;
create policy entries_insert
on public.entries
for insert
to authenticated
with check (
  (select public.get_user_role()) in ('editor', 'admin')
  and author_id = (select auth.uid())
);

drop policy if exists entries_update on public.entries;
create policy entries_update
on public.entries
for update
to authenticated
using (
  (author_id = (select auth.uid()) and (select public.get_user_role()) in ('editor', 'admin'))
  or (select public.get_user_role()) = 'admin'
)
with check (
  (author_id = (select auth.uid()) and (select public.get_user_role()) in ('editor', 'admin'))
  or (select public.get_user_role()) = 'admin'
);

drop policy if exists entries_delete on public.entries;
create policy entries_delete
on public.entries
for delete
to authenticated
using (
  (author_id = (select auth.uid()) and (select public.get_user_role()) in ('editor', 'admin'))
  or (select public.get_user_role()) = 'admin'
);

-- ----------------------------------------------------------------------------
-- subscriptions: per-user email preferences for posts and notes.
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  subscribe_posts boolean not null default true,
  subscribe_notes boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- Subscriptions RLS: strictly own-row for every action.
alter table public.subscriptions enable row level security;

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own
on public.subscriptions
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists subscriptions_insert_own on public.subscriptions;
create policy subscriptions_insert_own
on public.subscriptions
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists subscriptions_update_own on public.subscriptions;
create policy subscriptions_update_own
on public.subscriptions
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists subscriptions_delete_own on public.subscriptions;
create policy subscriptions_delete_own
on public.subscriptions
for delete
to authenticated
using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- collab_requests: readers asking to become editors.
-- ----------------------------------------------------------------------------
create table if not exists public.collab_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  decided_by uuid references public.profiles (id) on delete set null,
  decided_at timestamptz
);

-- At most one open request per user.
create unique index if not exists collab_requests_one_pending_per_user
on public.collab_requests (user_id)
where status = 'pending';

-- Collab requests RLS.
alter table public.collab_requests enable row level security;

-- Any signed-in user may file a request, but only a fresh 'pending' one:
-- the decision fields belong to admins.
drop policy if exists collab_requests_insert_own on public.collab_requests;
create policy collab_requests_insert_own
on public.collab_requests
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'pending'
  and decided_by is null
  and decided_at is null
);

drop policy if exists collab_requests_select on public.collab_requests;
create policy collab_requests_select
on public.collab_requests
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.get_user_role()) = 'admin'
);

drop policy if exists collab_requests_update_admin on public.collab_requests;
create policy collab_requests_update_admin
on public.collab_requests
for update
to authenticated
using ((select public.get_user_role()) = 'admin')
with check ((select public.get_user_role()) = 'admin');

-- ----------------------------------------------------------------------------
-- Admin RPCs for deciding collaboration requests.
-- SECURITY DEFINER so the role promotion works even though callers cannot
-- update other users' profiles directly; both re-check admin themselves.
-- ----------------------------------------------------------------------------
create or replace function public.approve_collab_request(request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  if public.get_user_role() <> 'admin' then
    raise exception 'only admins can approve collaboration requests'
      using errcode = '42501';
  end if;

  update public.collab_requests
  set status = 'approved',
      decided_by = auth.uid(),
      decided_at = now()
  where id = request_id
  returning user_id into v_user_id;

  if not found then
    raise exception 'collaboration request % not found', request_id;
  end if;

  -- Promote readers to editors. Admins keep their role.
  update public.profiles
  set role = 'editor'
  where id = v_user_id
    and role = 'reader';
end;
$$;

create or replace function public.decline_collab_request(request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.get_user_role() <> 'admin' then
    raise exception 'only admins can decline collaboration requests'
      using errcode = '42501';
  end if;

  update public.collab_requests
  set status = 'declined',
      decided_by = auth.uid(),
      decided_at = now()
  where id = request_id;

  if not found then
    raise exception 'collaboration request % not found', request_id;
  end if;
end;
$$;

-- Signed-in users only; the functions gate on admin internally.
revoke execute on function public.approve_collab_request(uuid) from public, anon;
revoke execute on function public.decline_collab_request(uuid) from public, anon;
grant execute on function public.approve_collab_request(uuid) to authenticated;
grant execute on function public.decline_collab_request(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- Admin bootstrap (run by hand, once).
-- Sign in on the site first so your profile row exists, then run this in the
-- SQL Editor with your own email:
--
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
-- ----------------------------------------------------------------------------
