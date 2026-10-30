import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Current signed-in user and whether they are the portfolio owner. Cached per request. */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, isOwner: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, user, isOwner: profile?.role === "owner" };
});

/** Use at the top of owner-only pages and server actions. */
export async function requireOwner() {
  const session = await getSession();
  if (!session.user) redirect("/login?next=/dashboard");
  if (!session.isOwner) redirect("/?denied=1");
  return session as typeof session & { user: NonNullable<typeof session.user> };
}

/** Only allow same-site relative redirects (prevents open-redirects via ?next=). */
export function safeNext(next: unknown, fallback = "/") {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const { headers } = await import("next/headers");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
