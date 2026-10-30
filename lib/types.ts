export type ProjectImage = {
  id?: string;
  project_id?: string;
  url: string;
  path: string; // storage object path, used to delete the file later
  caption: string | null;
  sort_order: number;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  category: string | null;
  location: string | null;
  year: number | null;
  area: string | null;
  software: string | null;
  cover_url: string | null;
  published: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  project_images?: ProjectImage[];
};

export type SiteProfile = {
  id: number;
  full_name: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  education: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
  cv_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
};

export type Message = {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  body: string;
  project_id: string | null;
  is_read: boolean;
  created_at: string;
  projects?: { title: string; slug: string } | null;
};

/** Shape returned by server actions used with useActionState. */
export type ActionState = { error?: string; success?: string } | undefined;
