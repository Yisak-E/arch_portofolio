"use server";

import { revalidatePath } from "next/cache";
import { friendlyError, requireUser } from "@/lib/auth";
import { emailOwner } from "@/lib/email";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

/** FR-034: client replies in their own conversation. */
export async function clientReply(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const conversation_id = str(form, "conversation_id", 64);
  const body = str(form, "body", 5000);
  if (!body) return { error: "Write a message first." };

  const { error } = await supabase
    .from("conversation_messages")
    .insert({ conversation_id, sender_id: user.id, body });
  if (error) return { error: friendlyError(error.message) };

  const { data: conv } = await supabase.from("conversations").select("subject").eq("id", conversation_id).single();
  await emailOwner(`New reply: ${conv?.subject ?? "conversation"}`, `From: ${user.email}\n\n${body}`, user.email);

  revalidatePath(`/account/messages/${conversation_id}`);
  return { success: "Sent." };
}
