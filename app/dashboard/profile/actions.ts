"use server";

import { revalidatePath } from "next/cache";
import { friendlyError, requireStaff } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { nullable, str } from "@/lib/utils";

function url(v: string) {
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export async function saveProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();

  const full_name = str(form, "full_name", 120);
  if (!full_name) return { error: "Your name is required." };

  const { data: current } = await supabase.from("site_profile").select("avatar_path").single();
  const avatar_path = nullable(str(form, "avatar_path", 300));

  const { error } = await supabase
    .from("site_profile")
    .update({
      full_name,
      headline: nullable(str(form, "headline", 160)),
      bio: nullable(str(form, "bio", 6000)),
      location: nullable(str(form, "location", 120)),
      education: nullable(str(form, "education", 1000)),
      credentials: nullable(str(form, "credentials", 2000)),
      public_email: nullable(str(form, "public_email", 200)),
      phone: nullable(str(form, "phone", 40)),
      website: url(str(form, "website", 300)),
      avatar_url: nullable(str(form, "avatar_url", 600)),
      avatar_path,
      cv_url: url(str(form, "cv_url", 600)),
      instagram_url: url(str(form, "instagram_url", 300)),
      linkedin_url: url(str(form, "linkedin_url", 300)),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { error: friendlyError(error.message) };

  // Remove the old portrait file if it was replaced.
  if (current?.avatar_path && current.avatar_path !== avatar_path) {
    await supabase.storage.from("portfolio").remove([current.avatar_path]);
  }

  revalidatePath("/", "layout");
  return { success: "Profile saved." };
}

/** FR-012: "delete" the public profile by clearing every field (one profile row always exists). */
export async function clearProfile() {
  const { supabase } = await requireStaff();
  const { data: current } = await supabase.from("site_profile").select("avatar_path").single();
  await supabase
    .from("site_profile")
    .update({
      full_name: "Your Name",
      headline: null,
      bio: null,
      location: null,
      education: null,
      credentials: null,
      public_email: null,
      phone: null,
      website: null,
      avatar_url: null,
      avatar_path: null,
      cv_url: null,
      instagram_url: null,
      linkedin_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (current?.avatar_path) await supabase.storage.from("portfolio").remove([current.avatar_path]);
  revalidatePath("/", "layout");
}
