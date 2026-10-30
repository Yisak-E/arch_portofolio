-- =====================================================================
-- Architecture portfolio: database schema
-- Already applied to the Supabase project "arch-portfolio" (ref dossiqaxjptjvjwngvrd).
-- To recreate it elsewhere: Supabase → SQL Editor → New query → paste → Run.
-- It is safe to re-run (uses IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).
-- =====================================================================

-- ---------- Profiles (one row per signed-in user) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  role        text not null default 'visitor' check (role in ('owner', 'visitor')),
  created_at  timestamptz not null default now()
);

-- Create a profile automatically when someone signs up (email or Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- True when the current request comes from the portfolio owner.
-- Lives in a private schema so it is not callable through the public REST API.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.is_owner()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'owner');
$$;
revoke execute on function private.is_owner() from public;
grant execute on function private.is_owner() to anon, authenticated;

-- ---------- Site profile (the owner's public "About" info; single row) ----------
create table if not exists public.site_profile (
  id             int primary key default 1 check (id = 1),
  full_name      text not null default 'Your Name',
  headline       text default 'Architecture student',
  bio            text,
  location       text,
  education      text,
  avatar_url     text,
  avatar_path    text,
  cv_url         text,
  instagram_url  text,
  linkedin_url   text,
  updated_at     timestamptz not null default now()
);
insert into public.site_profile (id) values (1) on conflict (id) do nothing;

-- ---------- Projects ----------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  summary      text,
  description  text,
  category     text,           -- e.g. Residential, Urban design, Studio project
  location     text,
  year         int,
  area         text,           -- e.g. "1,200 m²"
  software     text,           -- e.g. "Revit, Rhino, Lumion"
  cover_url    text,
  published    boolean not null default false,
  featured     boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  url         text not null,
  path        text not null,
  caption     text,
  sort_order  int not null default 0
);
create index if not exists project_images_project_idx on public.project_images(project_id, sort_order);

-- ---------- Messages (visitors → owner) ----------
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references auth.users(id) on delete cascade,
  sender_name   text not null check (char_length(sender_name) between 1 and 120),
  sender_email  text not null,
  subject       text not null check (char_length(subject) between 1 and 200),
  body          text not null check (char_length(body) between 1 and 5000),
  project_id    uuid references public.projects(id) on delete set null,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists messages_created_idx on public.messages(created_at desc);
create index if not exists messages_sender_idx on public.messages(sender_id, created_at desc);
create index if not exists messages_project_idx on public.messages(project_id);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles       enable row level security;
alter table public.site_profile   enable row level security;
alter table public.projects       enable row level security;
alter table public.project_images enable row level security;
alter table public.messages       enable row level security;

-- profiles: you can read your own row; the owner can read all.
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select using (id = (select auth.uid()) or private.is_owner());

drop policy if exists "profiles update own name" on public.profiles;
create policy "profiles update own name" on public.profiles
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- Users may only change their name — never their role.
revoke update on public.profiles from authenticated, anon;
grant update (full_name) on public.profiles to authenticated;

-- site_profile: everyone reads, only the owner edits.
drop policy if exists "site profile public read" on public.site_profile;
create policy "site profile public read" on public.site_profile
  for select using (true);
drop policy if exists "site profile owner write" on public.site_profile;
create policy "site profile owner write" on public.site_profile
  for update using (private.is_owner()) with check (private.is_owner());

-- projects: anyone (no sign-in) sees published projects; owner manages all.
drop policy if exists "projects public read" on public.projects;
create policy "projects public read" on public.projects
  for select using (published or private.is_owner());
drop policy if exists "projects owner insert" on public.projects;
create policy "projects owner insert" on public.projects
  for insert with check (private.is_owner());
drop policy if exists "projects owner update" on public.projects;
create policy "projects owner update" on public.projects
  for update using (private.is_owner()) with check (private.is_owner());
drop policy if exists "projects owner delete" on public.projects;
create policy "projects owner delete" on public.projects
  for delete using (private.is_owner());

drop policy if exists "images public read" on public.project_images;
create policy "images public read" on public.project_images
  for select using (
    exists (select 1 from public.projects p where p.id = project_id and (p.published or private.is_owner()))
  );
drop policy if exists "images owner insert" on public.project_images;
create policy "images owner insert" on public.project_images
  for insert with check (private.is_owner());
drop policy if exists "images owner update" on public.project_images;
create policy "images owner update" on public.project_images
  for update using (private.is_owner()) with check (private.is_owner());
drop policy if exists "images owner delete" on public.project_images;
create policy "images owner delete" on public.project_images
  for delete using (private.is_owner());

-- messages: signed-in users can send (as themselves) and see what they sent;
-- only the owner can read everything, mark as read, or delete.
drop policy if exists "messages insert own" on public.messages;
create policy "messages insert own" on public.messages
  for insert to authenticated with check (sender_id = (select auth.uid()) and is_read = false);
drop policy if exists "messages read" on public.messages;
create policy "messages read" on public.messages
  for select using (sender_id = (select auth.uid()) or private.is_owner());
drop policy if exists "messages owner update" on public.messages;
create policy "messages owner update" on public.messages
  for update using (private.is_owner()) with check (private.is_owner());
drop policy if exists "messages owner delete" on public.messages;
create policy "messages owner delete" on public.messages
  for delete using (private.is_owner());

-- Basic spam guard: at most 5 messages per sender per hour.
create or replace function public.limit_messages()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (select count(*) from public.messages
      where sender_id = new.sender_id and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many messages. Please try again later.';
  end if;
  return new;
end;
$$;
drop trigger if exists messages_rate_limit on public.messages;
create trigger messages_rate_limit
  before insert on public.messages
  for each row execute function public.limit_messages();

-- Trigger functions should not be callable directly through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.limit_messages() from public, anon, authenticated;

-- =====================================================================
-- Storage: public bucket for project photos and the avatar
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 15728640,
        array['image/jpeg','image/png','image/webp','image/gif','image/avif','application/pdf'])
on conflict (id) do nothing;

-- Files are served through their public URLs; only the owner can list, upload, replace or delete.
drop policy if exists "portfolio owner list" on storage.objects;
create policy "portfolio owner list" on storage.objects
  for select to authenticated using (bucket_id = 'portfolio' and private.is_owner());

drop policy if exists "portfolio owner insert" on storage.objects;
create policy "portfolio owner insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio' and private.is_owner());

drop policy if exists "portfolio owner update" on storage.objects;
create policy "portfolio owner update" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio' and private.is_owner());

drop policy if exists "portfolio owner delete" on storage.objects;
create policy "portfolio owner delete" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio' and private.is_owner());

-- =====================================================================
-- LAST STEP (run separately, after she has signed up once on the site):
-- make her account the owner. Replace the email with hers.
--
--   update public.profiles set role = 'owner' where email = 'her-email@example.com';
-- =====================================================================
