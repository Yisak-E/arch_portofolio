export type Role = "client" | "architect" | "owner" | "admin";
export type Visibility = "public" | "private" | "draft";
export type ProjectStatus = "concept" | "in_progress" | "completed" | "built" | "competition";
export type MediaKind = "image" | "drawing" | "document";
export type RequestStatus = "submitted" | "under_review" | "accepted" | "declined" | "completed" | "withdrawn";
export type ReportReason = "inappropriate" | "copyright" | "incorrect_credit" | "spam" | "other";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  phone: string | null;
  company: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_suspended: boolean;
  created_at: string;
};

export type Architect = {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  website: string | null;
  avatar_url: string | null;
  profile_id: string | null;
};

export type ProjectMedia = {
  id?: string;
  project_id?: string;
  kind: MediaKind;
  url: string;
  path: string;
  file_name: string | null;
  mime_type: string | null;
  caption: string | null;
  sort_order: number;
  uploaded_by?: string | null;
};

export type ProjectCredit = {
  id?: string;
  project_id?: string;
  architect_id: string;
  credit_role: string | null;
  can_edit: boolean;
  can_upload: boolean;
  sort_order: number;
  architects?: Pick<Architect, "id" | "name" | "title" | "website" | "profile_id"> | null;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  design_concept: string | null;
  materials: string | null;
  software: string | null;
  category: string | null;
  tags: string[];
  location: string | null;
  year: number | null;
  area: string | null;
  status: ProjectStatus;
  visibility: Visibility;
  is_shared: boolean;
  original_architect_id: string | null;
  source_url: string | null;
  cover_url: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  original_architect?: Pick<Architect, "id" | "name" | "title" | "website"> | null;
  project_media?: ProjectMedia[];
  project_collaborators?: ProjectCredit[];
};

export type SiteProfile = {
  id: number;
  full_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  education: string | null;
  credentials: string | null;
  public_email: string | null;
  phone: string | null;
  website: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
  cv_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
};

export type Conversation = {
  id: string;
  client_id: string;
  subject: string;
  project_id: string | null;
  status: "open" | "archived";
  owner_unread: boolean;
  client_unread: boolean;
  last_message_at: string;
  created_at: string;
  projects?: { title: string; slug: string } | null;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export type ConversationMessage = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  body: string;
  created_at: string;
};

export type CollaborationRequest = {
  id: string;
  client_id: string;
  title: string;
  project_type: string | null;
  description: string;
  location: string | null;
  budget: string | null;
  timeline: string | null;
  status: RequestStatus;
  owner_note: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export type Invite = {
  id: string;
  architect_id: string;
  email: string;
  message: string | null;
  status: "pending" | "accepted" | "rejected" | "revoked";
  created_at: string;
  responded_at: string | null;
  architects?: { name: string } | null;
};

export type Report = {
  id: string;
  reporter_id: string;
  project_id: string;
  reason: ReportReason;
  details: string | null;
  status: "open" | "resolved" | "dismissed";
  resolution_note: string | null;
  resolved_at: string | null;
  created_at: string;
  projects?: { title: string; slug: string; visibility: Visibility } | null;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export type AuditEntry = {
  id: number;
  actor_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  label: string | null;
  changes: Record<string, { from: unknown; to: unknown }> | null;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
};

/** Shape returned by server actions used with useActionState. */
export type ActionState = { error?: string; success?: string } | undefined;
