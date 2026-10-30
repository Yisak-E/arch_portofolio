"use server";

import { redirect } from "next/navigation";
import { friendlyError, getSession } from "@/lib/auth";
import { emailOwner } from "@/lib/email";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

/** FR-010: start a conversation with the owner. */
export async function startConversation(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user, profile } = await getSession();
  if (!user) return { error: "Please sign in to send a message." };
  if (profile?.is_suspended) return { error: "Your account is suspended." };

  const name = str(form, "name", 120);
  const subject = str(form, "subject", 200);
  const body = str(form, "body", 5000);
  const projectId = str(form, "project_id", 64);

  if (!subject || !body) return { error: "Please add a subject and a message." };
  if (body.length < 10) return { error: "Your message is a little short — add a few more details." };

  // Keep the user's display name up to date so the owner knows who is writing.
  if (name && name !== profile?.full_name) {
    await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
  }

  const { data: conv, error } = await supabase
    .from("conversations")
    .insert({ client_id: user.id, subject, project_id: projectId || null })
    .select("id")
    .single();
  if (error) return { error: friendlyError(error.message) };

  const { error: msgError } = await supabase
    .from("conversation_messages")
    .insert({ conversation_id: conv.id, sender_id: user.id, body });
  if (msgError) return { error: friendlyError(msgError.message) };

  await emailOwner(`New portfolio message: ${subject}`, `From: ${name || user.email} <${user.email}>\n\n${body}`, user.email);

  redirect(`/account/messages/${conv.id}?sent=1`);
}
