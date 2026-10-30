-- One-off upgrade of the live v1 database to v2 (run BEFORE schema.sql).
-- Keeps existing accounts and messages.

create temp table _old_messages on commit drop as select * from public.messages;

drop table if exists public.messages cascade;
drop table if exists public.project_images cascade;
drop table if exists public.projects cascade;
drop function if exists public.limit_messages() cascade;
drop function if exists private.is_owner() cascade;   -- also drops v1 policies that used it

drop policy if exists "profiles read own" on public.profiles;
drop policy if exists "profiles update own name" on public.profiles;
drop policy if exists "site profile public read" on public.site_profile;
drop policy if exists "site profile owner write" on public.site_profile;
drop policy if exists "portfolio owner list" on storage.objects;
drop policy if exists "portfolio owner insert" on storage.objects;
drop policy if exists "portfolio owner update" on storage.objects;
drop policy if exists "portfolio owner delete" on storage.objects;
drop policy if exists "portfolio public read" on storage.objects;

-- profiles: v1 → v2 columns and roles
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'client' where role = 'visitor';
update public.profiles set role = 'owner' where lower(email) = 'kidistmegersa440@gmail.com';
alter table public.profiles alter column role set default 'client';
alter table public.profiles
  add column if not exists phone text,
  add column if not exists company text,
  add column if not exists bio text,
  add column if not exists avatar_url text,
  add column if not exists is_suspended boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();
alter table public.profiles add constraint profiles_role_check
  check (role in ('client', 'architect', 'owner', 'admin'));

-- site_profile: new public contact / credential fields
alter table public.site_profile
  add column if not exists credentials text,
  add column if not exists public_email text,
  add column if not exists phone text,
  add column if not exists website text;
