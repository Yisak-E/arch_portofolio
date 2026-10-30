# Architecture Portfolio

A portfolio platform for an architecture student, built with **Next.js 15 (App Router)**, **Tailwind CSS v4** and **Supabase** (Postgres with Row Level Security, Auth, Storage).

The full, refined requirement list (FR-001 to FR-040), with acceptance criteria and where each one is implemented, is in **[docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)**.

## Roles at a glance

| Role | What they can do |
|---|---|
| **Visitor** (signed out) | Browse, search and filter public projects; view project details, credits and the owner's profile |
| **Client** (any registered user) | Everything above, plus message the owner, submit and track collaboration requests, report content, and manage their own profile |
| **Collaborating architect** | Accept invitations, see assigned projects (including private and draft), edit details and upload media where permitted, and manage their public credit card |
| **Portfolio owner** | Full dashboard: projects (Public/Private/Draft), media, shared projects, credits, collaborators and invitations, inbox, requests, profile; plus all admin tools |
| **Administrator** | Dashboard access plus user management, reported content and audit log |

All permissions are enforced in the database (RLS + triggers), not only in the UI.

## Project structure

```
app/
  (site)/              public pages: home, projects (search/filter), projects/[slug], about, contact
  (site)/account/      signed-in area: profile, messages, requests, notifications, invitations, my projects
  (auth)/              login, register (email + Google)
  auth/                OAuth/email callback, sign-out
  dashboard/           owner/admin: overview, projects, collaborators, messages, requests, profile,
                       users, reports, audit log, settings
components/            header, notification bell, cards, media uploader, message thread, forms
lib/                   Supabase clients, session/role helpers, types, constants, project search, save helpers
supabase/schema.sql    complete database schema (tables, RLS, triggers, RPCs, storage)
supabase/migrations/   one-off upgrade scripts that were applied to the live project
docs/REQUIREMENTS.md   functional requirements
```

## Setup

1. **Supabase project:** the live project `arch-portfolio` already has the schema applied. For a fresh project, run `supabase/schema.sql` in the SQL Editor.
2. **Environment:** copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **Auth URLs:** in Supabase → Authentication → URL Configuration, set the Site URL and add `http://localhost:3000/auth/callback` (and your production `/auth/callback`) to the Redirect URLs.
4. **Google sign-in (optional):** create an OAuth client in Google Cloud. Its redirect URI is `https://<project-ref>.supabase.co/auth/v1/callback`. Paste the client ID and secret into Supabase → Providers → Google.
5. **Run:** `npm install` then `npm run dev`.
6. **Owner:** after she signs up, run `update public.profiles set role = 'owner' where email = '…';` (already done for the live project).
7. **Owner email alerts (optional):** set `RESEND_API_KEY` and `OWNER_NOTIFY_EMAIL`. In-app notifications work without them.

## Notes

- Files live in the public `portfolio` bucket. Private/draft project files are not listed publicly, but anyone with a file's exact URL can open it.
- Rate limits: 5 new conversations/hour, 20 messages/hour, 5 requests/day, 10 reports/day per user.
- Recommended: enable **Leaked password protection** in Supabase → Authentication → Settings.
