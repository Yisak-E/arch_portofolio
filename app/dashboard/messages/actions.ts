"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { friendlyError, requireStaff } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

/** FR-024 */
export async function ownerReply(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await requireStaff();
  const conversation_id = str(form, "conversation_id", 64);
  const body = str(form, "body", 5000);
  if (!body) return { error: "Write a reply first." };

  const { error } = await supabase.from("conversation_messages").insert({ conversation_id, sender_id: user.id, body });
  if (error) return { error: friendlyError(error.message) };

  revalidatePath("/dashboard", "layout");
  return { success: "Sent." };
}

/** FR-023 */
export async function setRead(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase
    .from("conversations")
    .update({ owner_unread: form.get("unread") === "true" })
    .eq("id", str(form, "id", 64));
  revalidatePath("/dashboard", "layout");
}

export async function setArchived(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase
    .from("conversations")
    .update({ status: form.get("archived") === "true" ? "archived" : "open" })
    .eq("id", str(form, "id", 64));
  revalidatePath("/dashboard", "layout");
}

export async function deleteConversation(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("conversations").delete().eq("id", str(form, "id", 64));
  revalidatePath("/dashboard", "layout");
  if (form.get("redirect")) redirect("/dashboard/messages");
}
