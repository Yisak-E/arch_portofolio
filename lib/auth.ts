import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

type SessionProfile = {
  full_name: string | null;
  role: Role;
  is_suspended: boolean;
};

/** Current user, their profile and role flags. Cached per request. */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null, isStaff: false, isOwner: false, isArchitect: false };
  }

  const { data } = await supabase
    .from("profiles")
    .select("full_name, role, is_suspended")
    .eq("id", user.id)
    .single();
  const profile = (data ?? null) as SessionProfile | null;
  const active = !!profile && !profile.is_suspended;
  const role = profile?.role;

  return {
    supabase,
    user,
    profile,
    isOwner: active && role === "owner",
    isStaff: active && (role === "owner" || role === "admin"),
    isArchitect: active && (role === "architect" || role === "owner" || role === "admin"),
  };
});

type Session = Awaited<ReturnType<typeof getSession>>;
type SignedIn = Session & { user: NonNullable<Session["user"]> };

/** Any signed-in user. */
export async function requireUser(next = "/account") {
  const session = await getSession();
  if (!session.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session as SignedIn;
}

/** Owner or administrator (dashboard). */
export async function requireStaff() {
  const session = await getSession();
  if (!session.user) redirect("/login?next=/dashboard");
  if (!session.isStaff) redirect("/?denied=1");
  return session as SignedIn;
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

/** Turn a Postgres/Supabase error into a message safe to show users. */
export function friendlyError(message: string | undefined) {
  if (!message) return "Something went wrong. Please try again.";
  // Messages raised by our own database functions are written for users.
  if (/^(Too many|You |Your |Only |The |This |Please |Collaborators |Invitation )/.test(message)) return message;
  if (message.includes("row-level security") || message.includes("permission denied")) {
    return "You don't have permission to do that.";
  }
  if (message.includes("duplicate key")) return "That already exists.";
  if (message.includes("violates foreign key") && message.includes("original_architect")) {
    return "This architect is credited as the original author of a shared project and can't be deleted.";
  }
  return "Something went wrong. Please try again.";
}
