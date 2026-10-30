-- =====================================================================
-- Architecture portfolio: database schema v2
-- Implements docs/REQUIREMENTS.md (FR-001 … FR-040).
--
-- Live project: "arch-portfolio" (ref dossiqaxjptjvjwngvrd), already applied.
-- To recreate on a new Supabase project: SQL Editor → paste this file → Run.
-- =====================================================================

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

-- One row per signed-in user (FR-008, FR-011, FR-035)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text not null default '',
  role          text not null default 'client'
                check (role in ('client', 'architect', 'owner', 'admin')),
  phone         text,
  company       text,
  bio           text,
  avatar_url    text,
  is_suspended  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- The owner's public profile, single row (FR-005, FR-012)
create table if not exists public.site_profile (
  id             int primary key default 1 check (id = 1),
  full_name      text not null default 'Your Name',
  headline       text default 'Architecture student',
  bio            text,
  location       text,
  education      text,
  credentials    text,
  public_email   text,
  phone          text,
  website        text,
  avatar_url     text,
  avatar_path    text,
  cv_url         text,
  instagram_url  text,
  linkedin_url   text,
  updated_at     timestamptz not null default now()
);
insert into public.site_profile (id) values (1) on conflict (id) do nothing;

-- Architects who can be credited or shared from; optionally linked to an account (FR-006, FR-019..021, FR-030)
create table if not exists public.architects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  title       text,
  bio         text,
  website     text,
  avatar_url  text,
  profile_id  uuid unique references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Projects (FR-001..004, FR-013..019)
create table if not exists public.projects (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  title                  text not null check (char_length(title) between 1 and 200),
  summary                text,
  description            text,
  design_concept         text,
  materials              text,
  software               text,
  category               text,
  tags                   text[] not null default '{}',
  location               text,
  year                   int check (year between 1900 and 2100),
  area                   text,
  status                 text not null default 'completed'
                         check (status in ('concept', 'in_progress', 'completed', 'built', 'competition')),
  visibility             text not null default 'draft'
                         check (visibility in ('public', 'private', 'draft')),
  is_shared              boolean not null default false,
  original_architect_id  uuid references public.architects(id) on delete restrict,
  source_url             text,
  cover_url              text,
  featured               boolean not null default false,
  sort_order             int not null default 0,
  created_by             uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint shared_project_needs_architect check (not is_shared or original_architect_id is not null)
);
create index if not exists projects_visibility_idx on public.projects(visibility, sort_order);
create index if not exists projects_original_architect_idx on public.projects(original_architect_id);
create index if not exists projects_created_by_idx on public.projects(created_by);

-- Images, drawings and documents (FR-016, FR-029)
create table if not exists public.project_media (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  kind         text not null default 'image' check (kind in ('image', 'drawing', 'document')),
  url          text not null,
  path         text not null,
  file_name    text,
  mime_type    text,
  caption      text,
  sort_order   int not null default 0,
  uploaded_by  uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at   timestamptz not null default now()
);
create index if not exists project_media_project_idx on public.project_media(project_id, sort_order);
create index if not exists project_media_uploaded_by_idx on public.project_media(uploaded_by);

-- Credits and per-project permissions (FR-020, FR-021, FR-027..029)
create table if not exists public.project_collaborators (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  architect_id  uuid not null references public.architects(id) on delete cascade,
  credit_role   text,
  can_edit      boolean not null default false,
  can_upload    boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  unique (project_id, architect_id)
);
create index if not exists project_collaborators_architect_idx on public.project_collaborators(architect_id);

-- Collaboration invitations (FR-021, FR-026)
create table if not exists public.collaborator_invites (
  id            uuid primary key default gen_random_uuid(),
  architect_id  uuid not null references public.architects(id) on delete cascade,
  email         text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message       text,
  status        text not null default 'pending'
                check (status in ('pending', 'accepted', 'rejected', 'revoked')),
  invited_by    uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at    timestamptz not null default now(),
  responded_at  timestamptz
);
create unique index if not exists collaborator_invites_one_pending
  on public.collaborator_invites(architect_id) where status = 'pending';
create index if not exists collaborator_invites_email_idx on public.collaborator_invites(lower(email));
create index if not exists collaborator_invites_invited_by_idx on public.collaborator_invites(invited_by);

-- Threaded messaging (FR-010, FR-022..024, FR-034)
create table if not exists public.conversations (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  subject          text not null check (char_length(subject) between 1 and 200),
  project_id       uuid references public.projects(id) on delete set null,
  status           text not null default 'open' check (status in ('open', 'archived')),
  owner_unread     boolean not null default true,
  client_unread    boolean not null default false,
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now()
);
create index if not exists conversations_client_idx on public.conversations(client_id, last_message_at desc);
create index if not exists conversations_status_idx on public.conversations(status, last_message_at desc);
create index if not exists conversations_project_idx on public.conversations(project_id);

create table if not exists public.conversation_messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  sender_id        uuid references public.profiles(id) on delete set null default auth.uid(),
  body             text not null check (char_length(body) between 1 and 5000),
  created_at       timestamptz not null default now()
);
create index if not exists conversation_messages_conv_idx on public.conversation_messages(conversation_id, created_at);
create index if not exists conversation_messages_sender_idx on public.conversation_messages(sender_id, created_at desc);

-- Client project/collaboration requests (FR-032, FR-033)
create table if not exists public.collaboration_requests (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  title         text not null check (char_length(title) between 1 and 200),
  project_type  text,
  description   text not null check (char_length(description) between 1 and 5000),
  location      text,
  budget        text,
  timeline      text,
  status        text not null default 'submitted'
                check (status in ('submitted', 'under_review', 'accepted', 'declined', 'completed', 'withdrawn')),
  owner_note    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists collaboration_requests_client_idx on public.collaboration_requests(client_id, created_at desc);
create index if not exists collaboration_requests_status_idx on public.collaboration_requests(status);

-- Reported content (FR-038)
create table if not exists public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  project_id       uuid not null references public.projects(id) on delete cascade,
  reason           text not null check (reason in ('inappropriate', 'copyright', 'incorrect_credit', 'spam', 'other')),
  details          text check (char_length(details) <= 2000),
  status           text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolution_note  text,
  resolved_by      uuid references public.profiles(id) on delete set null,
  resolved_at      timestamptz,
  created_at       timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports(status, created_at desc);
create index if not exists reports_project_idx on public.reports(project_id);
create index if not exists reports_reporter_idx on public.reports(reporter_id, created_at desc);
create index if not exists reports_resolved_by_idx on public.reports(resolved_by);

-- In-app notifications (FR-040)
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

-- Audit trail (FR-039)
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  entity      text not null,
  entity_id   text,
  label       text,
  changes     jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_created_idx on public.audit_log(created_at desc);
create index if not exists audit_log_entity_idx on public.audit_log(entity, entity_id);
create index if not exists audit_log_actor_idx on public.audit_log(actor_id);

-- ---------------------------------------------------------------------
-- Helper functions used by security policies
-- ---------------------------------------------------------------------

create or replace function private.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('owner', 'admin') and not is_suspended
  );
$$;

create or replace function private.is_active_user()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and not is_suspended);
$$;

create or replace function private.is_architect()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('architect', 'owner', 'admin') and not is_suspended
  );
$$;

-- perm: null = any membership, 'edit', or 'upload'
create or replace function private.is_member(p_project uuid, p_perm text default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.project_collaborators pc
    join public.architects a on a.id = pc.architect_id
    join public.profiles pr on pr.id = a.profile_id
    where pc.project_id = p_project
      and a.profile_id = (select auth.uid())
      and not pr.is_suspended
      and (p_perm is null or (p_perm = 'edit' and pc.can_edit) or (p_perm = 'upload' and pc.can_upload))
  );
$$;

create or replace function private.can_view_project(p_project uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.projects where id = p_project and visibility = 'public')
      or private.is_staff()
      or private.is_member(p_project);
$$;

-- ---------------------------------------------------------------------
-- Generic triggers
-- ---------------------------------------------------------------------

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles', 'architects', 'projects', 'collaboration_requests'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function private.set_updated_at()', t);
  end loop;
end $$;

-- New account → Client profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Notifications (FR-040)
-- ---------------------------------------------------------------------

create or replace function private.notify(p_user uuid, p_type text, p_title text, p_body text, p_link text)
returns void language sql security definer set search_path = '' as $$
  insert into public.notifications (user_id, type, title, body, link)
  select p_user, p_type, left(p_title, 200), left(p_body, 300), p_link
  where p_user is not null and p_user is distinct from (select auth.uid());
$$;

create or replace function private.notify_staff(p_type text, p_title text, p_body text, p_link text)
returns void language sql security definer set search_path = '' as $$
  insert into public.notifications (user_id, type, title, body, link)
  select id, p_type, left(p_title, 200), left(p_body, 300), p_link
  from public.profiles
  where role in ('owner', 'admin') and id is distinct from (select auth.uid());
$$;

-- Messages: rate limit, unread flags, notifications
create or replace function private.before_conversation_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.conversations
      where client_id = new.client_id and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many new conversations. Please try again later.';
  end if;
  return new;
end;
$$;
drop trigger if exists before_insert on public.conversations;
create trigger before_insert before insert on public.conversations
  for each row execute function private.before_conversation_insert();

create or replace function private.before_message_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_staff() and (select count(*) from public.conversation_messages
      where sender_id = new.sender_id and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'Too many messages. Please try again later.';
  end if;
  return new;
end;
$$;
drop trigger if exists before_insert on public.conversation_messages;
create trigger before_insert before insert on public.conversation_messages
  for each row execute function private.before_message_insert();

create or replace function private.after_message_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  c public.conversations;
  from_staff boolean;
begin
  select * into c from public.conversations where id = new.conversation_id;
  from_staff := new.sender_id is distinct from c.client_id;

  if from_staff then
    update public.conversations
      set last_message_at = new.created_at, client_unread = true, owner_unread = false
      where id = c.id;
    perform private.notify(c.client_id, 'message', 'New reply: ' || c.subject, new.body,
                           '/account/messages/' || c.id);
  else
    update public.conversations
      set last_message_at = new.created_at, owner_unread = true, status = 'open'
      where id = c.id;
    perform private.notify_staff('message', 'New message: ' || c.subject, new.body,
                                 '/dashboard/messages/' || c.id);
  end if;
  return null;
end;
$$;
drop trigger if exists after_insert on public.conversation_messages;
create trigger after_insert after insert on public.conversation_messages
  for each row execute function private.after_message_insert();

-- Clients may only change their own read flag
create or replace function private.guard_conversation_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user = 'authenticated' and not private.is_staff() then
    if (to_jsonb(new) - 'client_unread') is distinct from (to_jsonb(old) - 'client_unread') then
      raise exception 'Not allowed';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists guard_update on public.conversations;
create trigger guard_update before update on public.conversations
  for each row execute function private.guard_conversation_update();

-- Collaboration requests
create or replace function private.before_request_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.collaboration_requests
      where client_id = new.client_id and created_at > now() - interval '1 day') >= 5 then
    raise exception 'Too many requests today. Please try again tomorrow.';
  end if;
  return new;
end;
$$;
drop trigger if exists before_insert on public.collaboration_requests;
create trigger before_insert before insert on public.collaboration_requests
  for each row execute function private.before_request_insert();

create or replace function private.guard_request_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user = 'authenticated' and not private.is_staff() then
    if new.status <> 'withdrawn' or old.status not in ('submitted', 'under_review')
       or (to_jsonb(new) - 'status' - 'updated_at') is distinct from (to_jsonb(old) - 'status' - 'updated_at') then
      raise exception 'You can only withdraw a request that is still open.';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists guard_update on public.collaboration_requests;
create trigger guard_update before update on public.collaboration_requests
  for each row execute function private.guard_request_update();

create or replace function private.after_request_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform private.notify_staff('request', 'New collaboration request: ' || new.title,
                                 new.description, '/dashboard/requests');
  elsif new.status is distinct from old.status then
    if new.status = 'withdrawn' then
      perform private.notify_staff('request', 'Request withdrawn: ' || new.title, null, '/dashboard/requests');
    else
      perform private.notify(new.client_id, 'request',
        'Your request "' || new.title || '" is now ' || replace(new.status, '_', ' '),
        new.owner_note, '/account/requests');
    end if;
  end if;
  return null;
end;
$$;
drop trigger if exists after_change on public.collaboration_requests;
create trigger after_change after insert or update on public.collaboration_requests
  for each row execute function private.after_request_change();

-- Invitations
create or replace function private.after_invite_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_name text;
begin
  select name into v_name from public.architects where id = new.architect_id;
  if tg_op = 'INSERT' then
    perform private.notify(
      (select id from public.profiles where lower(email) = lower(new.email) limit 1),
      'invite', 'You are invited to collaborate', new.message, '/account/invitations');
  elsif new.status is distinct from old.status and new.status in ('accepted', 'rejected') then
    perform private.notify_staff('invite',
      coalesce(v_name, new.email) || ' ' || new.status || ' your collaboration invitation',
      null, '/dashboard/collaborators');
  end if;
  return null;
end;
$$;
drop trigger if exists after_change on public.collaborator_invites;
create trigger after_change after insert or update on public.collaborator_invites
  for each row execute function private.after_invite_change();

-- Projects: shared / updated notifications
create or replace function private.after_project_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_link text := '/projects/' || new.slug;
begin
  -- Original architect: when a shared project becomes public
  if new.is_shared and new.visibility = 'public'
     and (tg_op = 'INSERT' or old.visibility <> 'public' or not old.is_shared) then
    perform private.notify(
      (select profile_id from public.architects where id = new.original_architect_id),
      'project', 'Your project "' || new.title || '" was shared in the portfolio', null, v_link);
  end if;

  -- Collaborators (and original architect): when an existing project is updated
  if tg_op = 'UPDATE' then
    insert into public.notifications (user_id, type, title, link)
    select distinct a.profile_id, 'project', 'Project updated: ' || new.title,
           case when new.visibility = 'public' then v_link else '/account/projects/' || new.id end
    from public.architects a
    where a.profile_id is not null
      and a.profile_id is distinct from (select auth.uid())
      and (a.id in (select architect_id from public.project_collaborators where project_id = new.id)
           or (new.is_shared and a.id = new.original_architect_id));
  end if;
  return null;
end;
$$;
drop trigger if exists after_change on public.projects;
create trigger after_change after insert or update on public.projects
  for each row execute function private.after_project_change();

create or replace function private.after_credit_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.notify(
    (select profile_id from public.architects where id = new.architect_id),
    'project', 'You were credited on "' || (select title from public.projects where id = new.project_id) || '"',
    new.credit_role, '/account/projects');
  return null;
end;
$$;
drop trigger if exists after_insert on public.project_collaborators;
create trigger after_insert after insert on public.project_collaborators
  for each row execute function private.after_credit_insert();

-- Collaborators cannot change visibility, sharing, slug, ordering or ownership
create or replace function private.guard_project_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user = 'authenticated' and not private.is_staff() then
    if new.visibility is distinct from old.visibility
       or new.featured is distinct from old.featured
       or new.is_shared is distinct from old.is_shared
       or new.original_architect_id is distinct from old.original_architect_id
       or new.source_url is distinct from old.source_url
       or new.slug is distinct from old.slug
       or new.sort_order is distinct from old.sort_order
       or new.created_by is distinct from old.created_by then
      raise exception 'Collaborators cannot change visibility, sharing, address or ordering.';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists guard_update on public.projects;
create trigger guard_update before update on public.projects
  for each row execute function private.guard_project_update();

-- Linked architects cannot re-link their card
create or replace function private.guard_architect_update()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user = 'authenticated' and not private.is_staff()
     and new.profile_id is distinct from old.profile_id then
    raise exception 'Not allowed';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_update on public.architects;
create trigger guard_update before update on public.architects
  for each row execute function private.guard_architect_update();

-- Reports
create or replace function private.before_report_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.reports
      where reporter_id = new.reporter_id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Too many reports today.';
  end if;
  return new;
end;
$$;
drop trigger if exists before_insert on public.reports;
create trigger before_insert before insert on public.reports
  for each row execute function private.before_report_insert();

create or replace function private.after_report_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform private.notify_staff('report',
    'Project reported: ' || coalesce((select title from public.projects where id = new.project_id), 'unknown'),
    replace(new.reason, '_', ' ') || coalesce(' — ' || new.details, ''), '/dashboard/reports');
  return null;
end;
$$;
drop trigger if exists after_insert on public.reports;
create trigger after_insert after insert on public.reports
  for each row execute function private.after_report_insert();

-- ---------------------------------------------------------------------
-- Audit trail (FR-039)
-- ---------------------------------------------------------------------

create or replace function private.audit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_new jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  v_old jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  v_changes jsonb;
begin
  if tg_op = 'UPDATE' then
    select jsonb_object_agg(key, jsonb_build_object(
             'from', case when jsonb_typeof(v_old->key) = 'string' then to_jsonb(left(v_old->>key, 200)) else v_old->key end,
             'to',   case when jsonb_typeof(value) = 'string' then to_jsonb(left(value #>> '{}', 200)) else value end))
      into v_changes
      from jsonb_each(v_new)
      where key not in ('updated_at', 'last_message_at', 'owner_unread', 'client_unread')
        and v_old->key is distinct from value;
    if v_changes is null then
      return null;
    end if;
  end if;

  insert into public.audit_log (actor_id, action, entity, entity_id, label, changes)
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    coalesce(v_new->>'id', v_old->>'id'),
    left(coalesce(v_new->>'title', v_old->>'title', v_new->>'name', v_old->>'name',
                  v_new->>'subject', v_old->>'subject', v_new->>'full_name', v_old->>'full_name',
                  v_new->>'email', v_old->>'email'), 200),
    v_changes
  );
  return null;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['projects', 'project_media', 'project_collaborators', 'architects',
                           'collaborator_invites', 'collaboration_requests', 'reports',
                           'conversations', 'profiles', 'site_profile'] loop
    execute format('drop trigger if exists audit on public.%I', t);
    execute format('create trigger audit after insert or update or delete on public.%I
                    for each row execute function private.audit()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- RPCs callable from the app
-- ---------------------------------------------------------------------

-- FR-026: accept or reject an invitation addressed to the signed-in user's email
create or replace function public.respond_to_invite(p_invite uuid, p_accept boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  inv public.collaborator_invites;
begin
  if v_uid is null then raise exception 'Please sign in.'; end if;
  select email into v_email from auth.users where id = v_uid and email_confirmed_at is not null;
  if v_email is null then raise exception 'Please confirm your email address first.'; end if;

  select * into inv from public.collaborator_invites where id = p_invite for update;
  if not found or lower(inv.email) <> lower(v_email) then raise exception 'Invitation not found.'; end if;
  if inv.status <> 'pending' then raise exception 'This invitation was already answered.'; end if;

  if p_accept then
    if exists (select 1 from public.architects where profile_id = v_uid and id <> inv.architect_id) then
      raise exception 'Your account is already linked to another architect profile.';
    end if;
    if exists (select 1 from public.architects where id = inv.architect_id and profile_id is not null and profile_id <> v_uid) then
      raise exception 'This architect profile is already linked to another account.';
    end if;
    update public.architects set profile_id = v_uid where id = inv.architect_id;
    update public.profiles set role = 'architect' where id = v_uid and role = 'client';
  end if;

  update public.collaborator_invites
    set status = case when p_accept then 'accepted' else 'rejected' end, responded_at = now()
    where id = p_invite;
end;
$$;

-- FR-037: change a user's role
create or replace function public.admin_set_user_role(p_user uuid, p_role text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_caller text;
  v_target text;
begin
  select role into v_caller from public.profiles where id = auth.uid() and not is_suspended;
  if coalesce(v_caller, '') not in ('owner', 'admin') then raise exception 'Not allowed.'; end if;
  if p_user = auth.uid() then raise exception 'You cannot change your own role.'; end if;
  if p_role not in ('client', 'architect', 'admin', 'owner') then raise exception 'Unknown role.'; end if;

  select role into v_target from public.profiles where id = p_user;
  if not found then raise exception 'User not found.'; end if;
  if (p_role in ('admin', 'owner') or v_target in ('admin', 'owner')) and v_caller <> 'owner' then
    raise exception 'Only the portfolio owner can grant or remove admin and owner roles.';
  end if;
  if v_target = 'owner' and p_role <> 'owner'
     and (select count(*) from public.profiles where role = 'owner') <= 1 then
    raise exception 'The last owner cannot be demoted.';
  end if;

  update public.profiles set role = p_role where id = p_user;
end;
$$;

-- FR-037: suspend or reactivate a user
create or replace function public.admin_set_user_suspended(p_user uuid, p_suspended boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_caller text;
  v_target text;
begin
  select role into v_caller from public.profiles where id = auth.uid() and not is_suspended;
  if coalesce(v_caller, '') not in ('owner', 'admin') then raise exception 'Not allowed.'; end if;
  if p_user = auth.uid() then raise exception 'You cannot suspend yourself.'; end if;

  select role into v_target from public.profiles where id = p_user;
  if not found then raise exception 'User not found.'; end if;
  if v_target = 'owner' then raise exception 'The owner cannot be suspended.'; end if;
  if v_target = 'admin' and v_caller <> 'owner' then raise exception 'Only the owner can suspend an admin.'; end if;

  update public.profiles set is_suspended = p_suspended where id = p_user;
end;
$$;

revoke execute on function public.respond_to_invite(uuid, boolean) from public, anon;
revoke execute on function public.admin_set_user_role(uuid, text) from public, anon;
revoke execute on function public.admin_set_user_suspended(uuid, boolean) from public, anon;
grant execute on function public.respond_to_invite(uuid, boolean) to authenticated;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;
grant execute on function public.admin_set_user_suspended(uuid, boolean) to authenticated;

-- Private functions: only the policy helpers need to be callable by API roles
revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_staff() to anon, authenticated;
grant execute on function private.is_active_user() to anon, authenticated;
grant execute on function private.is_architect() to anon, authenticated;
grant execute on function private.is_member(uuid, text) to anon, authenticated;
grant execute on function private.can_view_project(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Row Level Security (FR-036)
-- ---------------------------------------------------------------------

alter table public.profiles               enable row level security;
alter table public.site_profile           enable row level security;
alter table public.architects             enable row level security;
alter table public.projects               enable row level security;
alter table public.project_media          enable row level security;
alter table public.project_collaborators  enable row level security;
alter table public.collaborator_invites   enable row level security;
alter table public.conversations          enable row level security;
alter table public.conversation_messages  enable row level security;
alter table public.collaboration_requests enable row level security;
alter table public.reports                enable row level security;
alter table public.notifications          enable row level security;
alter table public.audit_log              enable row level security;

-- profiles
drop policy if exists "profiles select" on public.profiles;
create policy "profiles select" on public.profiles for select
  using (id = (select auth.uid()) or private.is_staff());
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone, company, bio, avatar_url) on public.profiles to authenticated;

-- site_profile
drop policy if exists "site profile select" on public.site_profile;
create policy "site profile select" on public.site_profile for select using (true);
drop policy if exists "site profile update" on public.site_profile;
create policy "site profile update" on public.site_profile for update to authenticated
  using (private.is_staff()) with check (private.is_staff());

-- architects (public cards)
drop policy if exists "architects select" on public.architects;
create policy "architects select" on public.architects for select using (true);
drop policy if exists "architects insert" on public.architects;
create policy "architects insert" on public.architects for insert to authenticated
  with check (private.is_staff());
drop policy if exists "architects update" on public.architects;
create policy "architects update" on public.architects for update to authenticated
  using (private.is_staff() or profile_id = (select auth.uid()))
  with check (private.is_staff() or profile_id = (select auth.uid()));
drop policy if exists "architects delete" on public.architects;
create policy "architects delete" on public.architects for delete to authenticated
  using (private.is_staff());

-- projects
drop policy if exists "projects select" on public.projects;
create policy "projects select" on public.projects for select
  using (visibility = 'public' or private.is_staff() or private.is_member(id));
drop policy if exists "projects insert" on public.projects;
create policy "projects insert" on public.projects for insert to authenticated
  with check (private.is_staff());
drop policy if exists "projects update" on public.projects;
create policy "projects update" on public.projects for update to authenticated
  using (private.is_staff() or private.is_member(id, 'edit'))
  with check (private.is_staff() or private.is_member(id, 'edit'));
drop policy if exists "projects delete" on public.projects;
create policy "projects delete" on public.projects for delete to authenticated
  using (private.is_staff());

-- project_media
drop policy if exists "media select" on public.project_media;
create policy "media select" on public.project_media for select
  using (private.can_view_project(project_id));
drop policy if exists "media insert" on public.project_media;
create policy "media insert" on public.project_media for insert to authenticated
  with check (private.is_staff() or private.is_member(project_id, 'upload'));
drop policy if exists "media update" on public.project_media;
create policy "media update" on public.project_media for update to authenticated
  using (private.is_staff() or (uploaded_by = (select auth.uid()) and private.is_member(project_id, 'upload')))
  with check (private.is_staff() or (uploaded_by = (select auth.uid()) and private.is_member(project_id, 'upload')));
drop policy if exists "media delete" on public.project_media;
create policy "media delete" on public.project_media for delete to authenticated
  using (private.is_staff() or (uploaded_by = (select auth.uid()) and private.is_member(project_id, 'upload')));

-- project_collaborators (credits)
drop policy if exists "credits select" on public.project_collaborators;
create policy "credits select" on public.project_collaborators for select
  using (private.can_view_project(project_id));
drop policy if exists "credits insert" on public.project_collaborators;
create policy "credits insert" on public.project_collaborators for insert to authenticated
  with check (private.is_staff());
drop policy if exists "credits update" on public.project_collaborators;
create policy "credits update" on public.project_collaborators for update to authenticated
  using (private.is_staff()) with check (private.is_staff());
drop policy if exists "credits delete" on public.project_collaborators;
create policy "credits delete" on public.project_collaborators for delete to authenticated
  using (private.is_staff());

-- collaborator_invites
drop policy if exists "invites select" on public.collaborator_invites;
create policy "invites select" on public.collaborator_invites for select to authenticated
  using (private.is_staff() or lower(email) = lower((select auth.jwt()) ->> 'email'));
drop policy if exists "invites insert" on public.collaborator_invites;
create policy "invites insert" on public.collaborator_invites for insert to authenticated
  with check (private.is_staff() and status = 'pending');
drop policy if exists "invites update" on public.collaborator_invites;
create policy "invites update" on public.collaborator_invites for update to authenticated
  using (private.is_staff()) with check (private.is_staff());
drop policy if exists "invites delete" on public.collaborator_invites;
create policy "invites delete" on public.collaborator_invites for delete to authenticated
  using (private.is_staff());

-- conversations
drop policy if exists "conversations select" on public.conversations;
create policy "conversations select" on public.conversations for select to authenticated
  using (client_id = (select auth.uid()) or private.is_staff());
drop policy if exists "conversations insert" on public.conversations;
create policy "conversations insert" on public.conversations for insert to authenticated
  with check (client_id = (select auth.uid()) and private.is_active_user() and status = 'open');
drop policy if exists "conversations update" on public.conversations;
create policy "conversations update" on public.conversations for update to authenticated
  using (client_id = (select auth.uid()) or private.is_staff())
  with check (client_id = (select auth.uid()) or private.is_staff());
drop policy if exists "conversations delete" on public.conversations;
create policy "conversations delete" on public.conversations for delete to authenticated
  using (private.is_staff());
revoke update on public.conversations from anon, authenticated;
grant update (status, owner_unread, client_unread) on public.conversations to authenticated;

-- conversation_messages
drop policy if exists "messages select" on public.conversation_messages;
create policy "messages select" on public.conversation_messages for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id
                 and (c.client_id = (select auth.uid()) or private.is_staff())));
drop policy if exists "messages insert" on public.conversation_messages;
create policy "messages insert" on public.conversation_messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and private.is_active_user()
              and exists (select 1 from public.conversations c where c.id = conversation_id
                          and (c.client_id = (select auth.uid()) or private.is_staff())));
drop policy if exists "messages delete" on public.conversation_messages;
create policy "messages delete" on public.conversation_messages for delete to authenticated
  using (private.is_staff());

-- collaboration_requests
drop policy if exists "requests select" on public.collaboration_requests;
create policy "requests select" on public.collaboration_requests for select to authenticated
  using (client_id = (select auth.uid()) or private.is_staff());
drop policy if exists "requests insert" on public.collaboration_requests;
create policy "requests insert" on public.collaboration_requests for insert to authenticated
  with check (client_id = (select auth.uid()) and private.is_active_user()
              and status = 'submitted' and owner_note is null);
drop policy if exists "requests update" on public.collaboration_requests;
create policy "requests update" on public.collaboration_requests for update to authenticated
  using (client_id = (select auth.uid()) or private.is_staff())
  with check (client_id = (select auth.uid()) or private.is_staff());
drop policy if exists "requests delete" on public.collaboration_requests;
create policy "requests delete" on public.collaboration_requests for delete to authenticated
  using (private.is_staff());

-- reports
drop policy if exists "reports select" on public.reports;
create policy "reports select" on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()) or private.is_staff());
drop policy if exists "reports insert" on public.reports;
create policy "reports insert" on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and private.is_active_user()
              and status = 'open' and private.can_view_project(project_id));
drop policy if exists "reports update" on public.reports;
create policy "reports update" on public.reports for update to authenticated
  using (private.is_staff()) with check (private.is_staff());
drop policy if exists "reports delete" on public.reports;
create policy "reports delete" on public.reports for delete to authenticated
  using (private.is_staff());

-- notifications (created only by database triggers)
drop policy if exists "notifications select" on public.notifications;
create policy "notifications select" on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "notifications update" on public.notifications;
create policy "notifications update" on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "notifications delete" on public.notifications;
create policy "notifications delete" on public.notifications for delete to authenticated
  using (user_id = (select auth.uid()));
revoke insert, update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- audit_log (read-only, staff)
drop policy if exists "audit select" on public.audit_log;
create policy "audit select" on public.audit_log for select to authenticated
  using (private.is_staff());
revoke insert, update, delete, truncate on public.audit_log from anon, authenticated;

-- ---------------------------------------------------------------------
-- Storage: public bucket for images, drawings, documents, avatars
-- Paths: projects/…, profile/…, cv/…, avatars/<user id>/…, architects/…
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 26214400,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio select" on storage.objects;
create policy "portfolio select" on storage.objects for select to authenticated
  using (bucket_id = 'portfolio' and (private.is_staff() or owner_id = (select auth.uid())::text));

drop policy if exists "portfolio insert" on storage.objects;
create policy "portfolio insert" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'portfolio' and private.is_active_user() and (
      private.is_staff()
      or name like 'avatars/' || (select auth.uid())::text || '/%'
      or (private.is_architect() and (name like 'projects/%' or name like 'architects/%'))
    )
  );

drop policy if exists "portfolio update" on storage.objects;
create policy "portfolio update" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio' and (private.is_staff() or owner_id = (select auth.uid())::text));

drop policy if exists "portfolio delete" on storage.objects;
create policy "portfolio delete" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and (private.is_staff() or owner_id = (select auth.uid())::text));

-- =====================================================================
-- Making someone the owner (run once, with their email, after they sign up):
--   update public.profiles set role = 'owner' where email = 'their-email@example.com';
-- =====================================================================
