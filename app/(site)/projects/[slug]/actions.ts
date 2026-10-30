"use server";

import { friendlyError, getSession } from "@/lib/auth";
import { REPORT_REASON_LABELS } from "@/lib/constants";
import type { ActionState } from "@/lib/types";
import { nullable, str } from "@/lib/utils";

export async function reportProject(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await getSession();
  if (!user) return { error: "Please sign in to report content." };

  const reason = str(form, "reason", 40);
  if (!(reason in REPORT_REASON_LABELS)) return { error: "Please choose a reason." };

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    project_id: str(form, "project_id", 64),
    reason,
    details: nullable(str(form, "details", 2000)),
  });
  if (error) return { error: friendlyError(error.message) };
  return { success: "Thank you. The report was sent to the site administrators." };
}
