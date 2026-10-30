# Architecture Portfolio

A portfolio site for an architecture student, built with **Next.js 15 (App Router)**, **Tailwind CSS v4** and **Supabase** (Postgres database, image storage and sign-in).

## What it does

| Who | Can do |
|---|---|
| **Anyone** (no account) | Browse the home page, all published projects (photos, drawings, descriptions, facts), the About page, and filter projects by category. |
| **Signed-in visitor** (Google or email + password) | Everything above, plus send her a message from **Contact** — optionally about a specific project. |
| **Owner** (her) | A private **Dashboard** to add / edit / delete / reorder projects, upload images with captions, publish or hide drafts, feature projects on the home page, read and manage messages, and edit her profile, portrait, CV and links. |

Security is enforced **in the database** (Row Level Security), not only in the UI. Visitors can only see published projects, can only send messages as themselves (max 5 per hour), and can never make themselves the owner.

## Project structure

```
app/
  (site)/            public pages: home, projects, projects/[slug], about, contact
  (auth)/            login, register (+ Google sign-in)
  auth/callback      handles Google / email-confirmation redirects
  auth/signout
  dashboard/         owner-only: overview, projects, messages, profile, settings
components/          header, footer, project card, image uploader, form bits
lib/                 Supabase clients, auth helpers, types
supabase/schema.sql  tables, security policies, storage bucket
middleware.ts        keeps the login session fresh, guards /dashboard
```

## Setup (about 15 minutes)

### 1. Create the Supabase project
1. Sign up at [supabase.com](https://supabase.com) and create a new project (the free tier is enough).
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql` and click **Run**.

### 2. Configure environment variables
```bash
cp .env.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings → API**.

### 3. Configure sign-in
In Supabase → **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000` (later: your real domain)
- **Redirect URLs**: add `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback`

**Google sign-in** (Authentication → Sign In / Providers → Google):
1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** (type: Web application).
2. Add the **Authorized redirect URI** shown in Supabase's Google provider panel (looks like `https://YOUR-PROJECT.supabase.co/auth/v1/callback`).
3. Paste the Google Client ID and Secret into Supabase and enable the provider.

Email + password works out of the box. Supabase sends a confirmation email to new accounts.

### 4. Run it
```bash
npm install
npm run dev
```
Open http://localhost:3000.

### 5. Make her the owner
1. She opens the site, clicks **Sign in**, and creates her account (Google or email).
2. In Supabase **SQL Editor**, run (with her email):
   ```sql
   update public.profiles set role = 'owner' where email = 'her-email@example.com';
   ```
3. She refreshes the page: a **Dashboard** link appears in the header.

### 6. (Optional) Email her when a message arrives
Create a free [Resend](https://resend.com) account and set `RESEND_API_KEY` and `OWNER_NOTIFY_EMAIL` in `.env.local`. Without it, messages still arrive in her dashboard inbox.

## Deploying
Deploy to [Vercel](https://vercel.com): import the GitHub repo, add the same environment variables (with `NEXT_PUBLIC_SITE_URL` set to the real domain), and add the production `/auth/callback` URL to Supabase's Redirect URLs.

## Notes
- Images are stored in the public `portfolio` bucket. Files from draft projects are not listed anywhere public, but anyone with the exact file URL can open them.
- Removing an image from a project, or deleting a project, also deletes its files from storage.
