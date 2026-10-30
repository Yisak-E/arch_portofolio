"use server";

import { revalidatePath } from "next/cache";
import { friendlyError, requireStaff } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { nullable, str } from "@/lib/utils";

function url(v: string) {
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** FR-021: create or update an architect card. */
export async function saveArchitect(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const id = str(form, "id", 64);
  const name = str(form, "name", 120);
  if (!name) return { error: "Name is required." };

  const row = {
    name,
    title: nullable(str(form, "title", 160)),
    website: url(str(form, "website", 300)),
    bio: nullable(str(form, "bio", 2000)),
  };
  const { error } = id
    ? await supabase.from("architects").update(row).eq("id", id)
    : await supabase.from("architects").insert(row);
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/dashboard/collaborators");
  return { success: id ? "Saved." : `${name} added.` };
}

export async function deleteArchitect(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("architects").delete().eq("id", str(form, "id", 64));
  revalidatePath("/", "layout");
}

/** FR-021: invite by email. The invitee sees it under Account → Invitations after signing in. */
export async function inviteArchitect(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const architect_id = str(form, "architect_id", 64);
  const email = str(form, "email", 200).toLowerCase();
  if (!architect_id || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a valid email address." };

  const { error } = await supabase.from("collaborator_invites").insert({
    architect_id,
    email,
    message: nullable(str(form, "message", 1000)),
  });
  if (error) {
    return {
      error: error.message.includes("collaborator_invites_one_pending")
        ? "There is already a pending invitation for this architect."
        : friendlyError(error.message),
    };
  }

  revalidatePath("/dashboard/collaborators");
  return {
    success: `Invitation created. Ask them to sign in (or register) with ${email} and open Account → Invitations.`,
  };
}

export async function revokeInvite(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase
    .from("collaborator_invites")
    .update({ status: "revoked", responded_at: new Date().toISOString() })
    .eq("id", str(form, "id", 64))
    .eq("status", "pending");
  revalidatePath("/dashboard/collaborators");
}

/** Remove the link between an architect card and a user account. */
export async function unlinkArchitect(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("architects").update({ profile_id: null }).eq("id", str(form, "id", 64));
  revalidatePath("/dashboard/collaborators");
}
