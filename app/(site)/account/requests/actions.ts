"use server";

import { revalidatePath } from "next/cache";
import { friendlyError, requireUser } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { nullable, str } from "@/lib/utils";

/** FR-032 */
export async function submitRequest(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const title = str(form, "title", 200);
  const description = str(form, "description", 5000);
  if (!title || !description) return { error: "Please add a title and a description." };

  const { error } = await supabase.from("collaboration_requests").insert({
    client_id: user.id,
    title,
    description,
    project_type: nullable(str(form, "project_type", 80)),
    location: nullable(str(form, "location", 120)),
    budget: nullable(str(form, "budget", 80)),
    timeline: nullable(str(form, "timeline", 80)),
  });
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/account/requests");
  return { success: "Request submitted. You'll be notified when its status changes." };
}

/** FR-033: a client may withdraw while the request is still open. */
export async function withdrawRequest(form: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("collaboration_requests").update({ status: "withdrawn" }).eq("id", str(form, "id", 64));
  revalidatePath("/account/requests");
}
