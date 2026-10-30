"use server";

import { getSession } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

export async function sendMessage(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase, user } = await getSession();
  if (!user) return { error: "Please sign in to send a message." };

  const sender_name = str(form, "name", 120);
  const subject = str(form, "subject", 200);
  const body = str(form, "body", 5000);
  const projectId = str(form, "project_id", 64);

  if (!sender_name || !subject || !body) return { error: "Please fill in your name, a subject and a message." };
  if (body.length < 10) return { error: "Your message is a little short — add a few more details." };

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    sender_name,
    sender_email: user.email!,
    subject,
    body,
    project_id: projectId || null,
  });

  if (error) {
    return {
      error: error.message.includes("Too many messages")
        ? "You've sent several messages recently. Please wait a bit before sending another."
        : "Something went wrong sending your message. Please try again.",
    };
  }

  await notifyOwner({ sender_name, sender_email: user.email!, subject, body }).catch(() => {
    // Notification is best-effort; the message is already saved in her inbox.
  });

  return { success: "Thank you — your message was sent. She'll reply to your email." };
}

async function notifyOwner(m: { sender_name: string; sender_email: string; subject: string; body: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_NOTIFY_EMAIL;
  if (!key || !to) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to,
      reply_to: m.sender_email,
      subject: `New portfolio message: ${m.subject}`,
      text: `From: ${m.sender_name} <${m.sender_email}>\n\n${m.body}\n\n— Open your dashboard to see all messages.`,
    }),
  });
}
