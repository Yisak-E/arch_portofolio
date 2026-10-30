"use server";

import { revalidatePath } from "next/cache";
import { friendlyError, requireUser } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

/** FR-026: accept or decline (validated by the respond_to_invite database function). */
export async function respondToInvite(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireUser();
  const accept = form.get("accept") === "true";

  const { error } = await supabase.rpc("respond_to_invite", {
    p_invite: str(form, "id", 64),
    p_accept: accept,
  });
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/", "layout");
  return {
    success: accept
      ? "Welcome aboard! Your assigned projects are under “My projects”."
      : "Invitation declined.",
  };
}
