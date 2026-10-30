/** Optional email to the owner (FR-040). Does nothing unless RESEND_API_KEY and OWNER_NOTIFY_EMAIL are set. */
export async function emailOwner(subject: string, text: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_NOTIFY_EMAIL;
  if (!key || !to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to,
        reply_to: replyTo,
        subject,
        text,
      }),
    });
  } catch {
    // Best effort: the in-app notification is the source of truth.
  }
}
