"use server";

import { revalidatePath } from "next/cache";
import { friendlyError, requireUser } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { nullable, str } from "@/lib/utils";

function url(v: string) {
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** FR-011: personal profile. Role and suspension are not editable here (column grants). */
export async function savePersonalProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const full_name = str(form, "full_name", 120);
  if (!full_name) return { error: "Please enter your name." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone: nullable(str(form, "phone", 40)),
      company: nullable(str(form, "company", 120)),
      bio: nullable(str(form, "bio", 2000)),
      avatar_url: nullable(str(form, "avatar_url", 600)),
    })
    .eq("id", user.id);
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/", "layout");
  return { success: "Profile saved." };
}

/** FR-030: a collaborating architect edits their public credit card. */
export async function saveArchitectCard(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const name = str(form, "name", 120);
  if (!name) return { error: "Name is required." };

  const { error, count } = await supabase
    .from("architects")
    .update(
      {
        name,
        title: nullable(str(form, "title", 160)),
        bio: nullable(str(form, "bio", 2000)),
        website: url(str(form, "website", 300)),
        avatar_url: nullable(str(form, "avatar_url", 600)),
      },
      { count: "exact" }
    )
    .eq("profile_id", user.id);
  if (error) return { error: friendlyError(error.message) };
  if (!count) return { error: "No architect profile is linked to your account." };

  revalidatePath("/", "layout");
  return { success: "Architect profile saved." };
}

/** FR-040: notifications */
export async function markNotificationRead(form: FormData) {
  const { supabase } = await requireUser();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", str(form, "id", 64));
  revalidatePath("/", "layout");
}

export async function markAllNotificationsRead() {
  const { supabase, user } = await requireUser();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
  revalidatePath("/", "layout");
}

export async function deleteNotification(form: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("notifications").delete().eq("id", str(form, "id", 64));
  revalidatePath("/account/notifications");
}
