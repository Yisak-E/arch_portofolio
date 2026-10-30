"use server";

import { revalidatePath } from "next/cache";
import { friendlyError, requireUser } from "@/lib/auth";
import { parseDetails, parseMedia, syncMedia } from "@/lib/project-save";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

/** FR-028 / FR-029. RLS + guard triggers enforce the permissions; the flags only decide what to send. */
export async function saveCollaboratorProject(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const id = str(form, "id", 64);
  const canEdit = form.get("can_edit") === "true";
  const canUpload = form.get("can_upload") === "true";

  if (canEdit) {
    const parsed = parseDetails(form);
    if ("error" in parsed) return { error: parsed.error };
    const { error, count } = await supabase.from("projects").update(parsed.row, { count: "exact" }).eq("id", id);
    if (error) return { error: friendlyError(error.message) };
    if (!count) return { error: "You don't have permission to edit this project." };
  }

  if (canUpload) {
    const err = await syncMedia(supabase, id, parseMedia(str(form, "media", 100_000)), {
      onlyUploadedBy: user.id,
      sortOffset: 1000,
    });
    if (err) return { error: friendlyError(err) };
  }

  revalidatePath("/", "layout");
  return { success: "Saved." };
}
