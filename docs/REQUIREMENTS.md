# Architecture Portfolio: Functional Requirements

**Version:** 2.0 · **Updated:** 30 Oct 2026  
**System:** Next.js 15 + Supabase (Postgres with Row Level Security, Auth, Storage)

This document refines the original requirement list (FR-001 to FR-040). The IDs are unchanged so they can still be traced. Where an original requirement was ambiguous or overlapped with another, the change is recorded under **Refinement**. Each requirement has acceptance criteria and points to where it is implemented.

---

## 0. Definitions

### 0.1 Roles (FR-035)

| Role | Who | How they get it |
|---|---|---|
| **Visitor** | Anyone who is not signed in | Default for anonymous browsing |
| **Client** | Any registered user | Automatically on sign-up (email + password or Google) |
| **Collaborating Architect** | An architect who accepted a collaboration invitation | Automatically when they accept an invitation (FR-026) |
| **Portfolio Owner** | The student whose portfolio this is | Set once by an administrator |
| **Administrator** | Trusted operator of the site | Set by the Portfolio Owner |

> **Refinement:** "Visitor" is not an account type; it is anyone signed out. Everyone who registers starts as a **Client**, so FR-008 (register) and FR-031 (client registration) describe the same flow. The **Portfolio Owner** also has all administrator permissions, because it is her site. The Owner and Administrators together are called **staff** below.

### 0.2 Project visibility (FR-017)

| Visibility | Who can see it | Typical use |
|---|---|---|
| **Public** | Everyone, including visitors | Finished work shown in the portfolio |
| **Private** | Staff and the project's collaborators | Finished work kept out of the public portfolio (e.g. under NDA) |
| **Draft** | Staff and the project's collaborators | Work in progress; cannot be featured on the home page |

### 0.3 Project status (FR-004)

`Concept` · `In progress` · `Completed` · `Built` · `Competition entry`

### 0.4 Media types (FR-016)

`Image` (photos, renders) · `Drawing` (plans, sections, blueprints, as image or PDF) · `Document` (PDF reports, boards). Allowed formats: JPG, PNG, WebP, GIF, AVIF, PDF, up to 25 MB each.

---

## 1. Visitor (public user)

### FR-001 View public portfolio
The system shall let visitors browse all **Public** projects without signing in.
- **Acceptance:** A signed-out user can open `/`, `/projects` and any public project page. Private and Draft projects never appear and return 404 to them.
- **Implemented:** `app/(site)/page.tsx`, `app/(site)/projects/*`; enforced by RLS policy `projects select`.

### FR-002 Search projects
The system shall let visitors search projects by title, category, location, architect name, tags or keywords in the summary, description, design concept and materials.
- **Refinement:** "architect name" matches the original architect of shared projects and every credited collaborator.
- **Acceptance:** Typing a term into the search box on `/projects` returns only matching public projects. Matching is case-insensitive and partial.
- **Implemented:** `lib/projects.ts → filterProjects()`, `app/(site)/projects/page.tsx`.

### FR-003 Filter projects
The system shall let visitors filter projects by **category (project type)**, **year**, **status** and **architect**, and combine filters with search.
- **Acceptance:** The filter options list only values that exist in public projects. Active filters are kept in the URL, so filtered results can be shared.
- **Implemented:** `app/(site)/projects/page.tsx`.

### FR-004 View project details
The system shall show, for each visible project: title, summary, description, image/drawing gallery, downloadable documents, location, year, area, **design concept**, **materials**, **tools/technologies**, **status**, category and tags.
- **Implemented:** `app/(site)/projects/[slug]/page.tsx`.

### FR-005 View architect profile
The system shall show the Portfolio Owner's public profile: name, headline, biography, portrait, education, professional credentials, location, public contact details, social links and CV.
- **Implemented:** `app/(site)/about/page.tsx`.

### FR-006 View collaborator credits
The system shall show the name, title and credited role of every collaborator on a project page.
- **Implemented:** "Credits" section in `app/(site)/projects/[slug]/page.tsx`; data in `project_collaborators` and `architects`.

### FR-007 View shared projects
The system shall let visitors view projects the Owner shared from other architects. The original architect's attribution is preserved and clearly visible.
- **Acceptance:** A shared project shows a "Shared project · Original work by *Name*" label on its card and page, plus a link to the original source if one is given. It can be filtered by that architect.
- **Implemented:** `projects.is_shared`, `projects.original_architect_id`, `projects.source_url`; `components/ProjectCard.tsx`.

### FR-008 Register account
The system shall let visitors create an account with email + password (with email confirmation) or with Google.
- **Implemented:** `app/(auth)/register`, `app/auth/callback`; trigger `handle_new_user` creates a **Client** profile.

### FR-009 Sign in
The system shall let registered users sign in with email + password or with Google, and sign out.
- **Refinement:** Google sign-in was added alongside email + password.
- **Acceptance:** Suspended users (FR-037) can sign in but cannot send messages, requests or reports.
- **Implemented:** `app/(auth)/login`, `app/auth/signout`.

### FR-010 Contact architect
The system shall let signed-in users start a conversation with the Owner from **Get in touch**, optionally about a specific project. Visitors who are not signed in are asked to sign in and then returned to the form.
- **Refinement:** Messages are threaded conversations, so the same mechanism also covers FR-024 and FR-034.
- **Acceptance:** A user can start at most 5 conversations and send at most 20 messages per hour.
- **Implemented:** `app/(site)/contact`, tables `conversations` and `conversation_messages`.

### FR-011 Manage personal profile
The system shall let every signed-in user update their own name, phone, company/organisation, short bio and profile picture. Users cannot change their own role.
- **Implemented:** `app/(site)/account/page.tsx`; column-level grants on `profiles`.

---

## 2. Portfolio Owner

### FR-012 Manage profile
The system shall let the Owner create, update and clear her public profile: biography, headline, portrait, education, **professional credentials**, location, **public contact email and phone**, website, social links (Instagram, LinkedIn) and CV.
- **Refinement:** Exactly one public profile always exists, so "delete" means clearing its fields (the **Clear profile** action).
- **Implemented:** `app/dashboard/profile`.

### FR-013 Create project
- **Implemented:** `app/dashboard/projects/new`.

### FR-014 Update project
- **Implemented:** `app/dashboard/projects/[id]`.

### FR-015 Delete project
Deleting a project also deletes its media files and credits. It requires confirmation.
- **Implemented:** `deleteProject` in `app/dashboard/projects/actions.ts`.

### FR-016 Upload media
The system shall let the Owner upload images, drawings/blueprints and documents (see 0.4), each with a caption and type, and reorder them. The first image is the cover.
- **Implemented:** `components/MediaUploader.tsx`, table `project_media`, storage bucket `portfolio`.

### FR-017 Set project visibility
The Owner can set any project to **Public**, **Private** or **Draft** (see 0.2), from the project form or directly from the project list.
- **Implemented:** `projects.visibility`; `setVisibility` action.

### FR-018 Manage categories and tags
The system shall let the Owner give each project one category (from suggestions or free text) and any number of tags.
- **Implemented:** `projects.category`, `projects.tags`.

### FR-019 Share external projects
The system shall let the Owner publish a project created by another architect by marking it **Shared** and naming the original architect (required) plus an optional source link.
- **Acceptance:** A project cannot be saved as shared without an original architect (database constraint). If the original architect has an account, they are notified when it is shared or updated (FR-040).

### FR-020 Credit collaborators
The system shall let the Owner credit any number of architects on a project with a free-text role (e.g. "Lead designer", "Structural concept"), shown on the project page in the order she chooses.
- **Implemented:** "Credits & collaborators" section of the project form; table `project_collaborators`.

### FR-021 Manage collaborators
The system shall let the Owner:
1. add, edit and delete architect records (name, title, bio, website, picture);
2. invite an architect by email to join as a Collaborating Architect;
3. see invitation status (pending, accepted, rejected, revoked) and revoke pending invitations;
4. grant per-project permissions to linked architects: **can edit details** and **can upload media**.
- **Implemented:** `app/dashboard/collaborators`, tables `architects` and `collaborator_invites`.

### FR-022 View messages
Staff see every conversation with sender, subject, related project, last activity and unread state.
- **Implemented:** `app/dashboard/messages`.

### FR-023 Manage messages
Staff can mark conversations read/unread, **archive** and un-archive them, and delete them. A new reply from the client moves an archived conversation back to the inbox.

### FR-024 Reply to messages
Staff can reply inside the conversation. The client sees the reply in their account and gets a notification. A "reply by email" shortcut is also available.

### FR-025 Dashboard overview
The dashboard shows: total projects, public, private and draft projects, shared projects, collaborators, conversations (total and unread), open collaboration requests and open reports.
- **Implemented:** `app/dashboard/page.tsx`.

---

## 3. Collaborating Architect

### FR-026 Accept collaboration invitations
A signed-in user whose account email matches a pending invitation can accept or reject it. Accepting links them to the architect record and grants the **Collaborating Architect** role.
- **Acceptance:** Invitations only show to the matching email. Each invitation can be answered once. The Owner is notified of the response.
- **Implemented:** `app/(site)/account/invitations`; RPC `respond_to_invite`.

### FR-027 View assigned projects
Collaborating Architects see every project they are credited on, including Private and Draft ones.
- **Implemented:** `app/(site)/account/projects`.

### FR-028 Update collaborative projects
Collaborators with **can edit** can change a project's descriptive fields (title, summary, description, design concept, materials, tools, category, tags, location, year, area, status). They cannot change visibility, featured state, sharing/attribution, web address or credits.
- **Implemented:** `app/(site)/account/projects/[id]`; enforced by RLS plus trigger `guard_project_update`.

### FR-029 Upload collaborative assets
Collaborators with **can upload** can add images, drawings and documents to the project. They can edit or remove only the files they uploaded.

### FR-030 Manage personal architect profile
Collaborating Architects can edit the public architect card shown in credits (name, title, bio, website, picture).
- **Implemented:** "Architect profile" section in `app/(site)/account/page.tsx`.

---

## 4. Client

### FR-031 Client registration
Covered by FR-008 and FR-011 (every registered user is a Client).

### FR-032 Request collaboration
Clients can submit a collaboration/project request with title, project type, description, location, budget range and timeline.
- **Implemented:** `app/(site)/account/requests`, table `collaboration_requests`.

### FR-033 Track collaboration requests
Clients see each request's status (**Submitted → Under review → Accepted / Declined → Completed**) and the Owner's note. They can **withdraw** a request while it is Submitted or Under review. Staff update status and notes from `app/dashboard/requests`.

### FR-034 Exchange messages
Clients and the Owner exchange messages in threaded conversations (see FR-010, FR-024). Clients see their conversations at `/account/messages`.

---

## 5. Administration and access control

### FR-035 Role-based access control
The system supports the roles in section 0.1.

### FR-036 Permission management
Permissions are enforced **in the database** with Row Level Security, so they cannot be bypassed from the browser:

| Capability | Visitor | Client | Collab. architect | Owner | Admin |
|---|:-:|:-:|:-:|:-:|:-:|
| Browse public projects & profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| See Private / Draft projects | – | – | own projects | ✓ | ✓ |
| Message the Owner, submit requests, report content | – | ✓ | ✓ | – | – |
| Edit own account profile | – | ✓ | ✓ | ✓ | ✓ |
| Edit assigned project details / upload media | – | – | if granted | ✓ | ✓ |
| Create / delete projects, credits, architects, invitations | – | – | – | ✓ | ✓ |
| Read & reply to all messages, manage requests | – | – | – | ✓ | ✓ |
| Manage users, reports, audit log | – | – | – | ✓ | ✓ |
| Grant or remove Admin / Owner role | – | – | – | ✓ | – |

### FR-037 Manage users
Staff can list users, change roles (Client ↔ Collaborating Architect; only the Owner can grant or remove Admin/Owner), and **suspend / reactivate** accounts. Users cannot change their own role or suspend themselves. The last Owner cannot be demoted, and Owners cannot be suspended.
- **Implemented:** `app/dashboard/users`; RPCs `admin_set_user_role` and `admin_set_user_suspended`.

### FR-038 Manage reported content
Signed-in users can report a project (inappropriate, copyright, incorrect credit, spam, other). Staff review reports and either **dismiss** them, **hide the project** (set to Private) or **delete the project**, with a resolution note.
- **Implemented:** "Report" on project pages; `app/dashboard/reports`; table `reports`.

### FR-039 Audit activity
The system records significant actions automatically in the database: who did what to which record, and which fields changed. This covers creating, updating and deleting projects, credits, architects, invitations, requests, reports and conversations; profile changes; and role and suspension changes. Only staff can read the log, and nobody can edit it.
- **Implemented:** trigger `private.audit()`, table `audit_log`, `app/dashboard/audit`.

### FR-040 Notification management
The system creates in-app notifications (a bell in the header with an unread count, plus `/account/notifications`) when:

| Event | Recipient |
|---|---|
| A message is received | Owner/staff (from a client); the client (from staff) |
| A collaboration request is submitted or withdrawn | Owner/staff |
| A collaboration request's status changes | The client |
| A collaboration invitation is received | The invited user (if they already have an account) |
| An invitation is accepted or rejected | Owner/staff |
| A project is shared or updated | The project's linked collaborators and the original architect of a shared project |
| Content is reported | Owner/staff |

Users can mark notifications read individually or all at once. Optionally, the Owner also gets an **email** for each new client message when `RESEND_API_KEY` is configured.
- **Implemented:** table `notifications`, database triggers, `components/NotificationBell.tsx`.

---

## 6. Non-functional requirements (added)

| ID | Requirement |
|---|---|
| NFR-001 | **Security:** all authorisation is enforced by Postgres RLS. Server code never uses a service-role key. |
| NFR-002 | **Spam protection:** rate limits on conversations (5/h), messages (20/h), requests (5/day) and reports (10/day) per user. |
| NFR-003 | **Privacy:** user emails are visible only to the user and staff. Collaborators' public cards contain only what they choose to show. |
| NFR-004 | **Responsiveness:** every page works from 360 px phone width to desktop. |
| NFR-005 | **Data integrity:** deleting a project removes its media files, credits and reports; deleting a user removes their conversations, requests and notifications. |
| NFR-006 | **Traceability:** schema changes live in `supabase/schema.sql`, and every requirement above lists its implementation location. |
