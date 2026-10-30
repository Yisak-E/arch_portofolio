"use server";

import { redirect } from "next/navigation";
import { safeNext, siteUrl } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

export async function signIn(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = str(form, "email", 200);
  const password = str(form, "password", 200);
  const next = safeNext(form.get("next"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error: error.message.includes("Email not confirmed")
        ? "Please confirm your email first — check your inbox for the link."
        : "Incorrect email or password.",
    };
  }
  redirect(next);
}

export async function signUp(_prev: ActionState, form: FormData): Promise<ActionState> {
  const full_name = str(form, "full_name", 120);
  const email = str(form, "email", 200);
  const password = str(form, "password", 200);
  const next = safeNext(form.get("next"));

  if (!full_name) return { error: "Please enter your name." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const base = await siteUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${base}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return { error: error.message };

  // If email confirmation is turned off in Supabase, the user is signed in right away.
  if (data.session) redirect(next);

  return { success: "Check your inbox — we sent you a link to confirm your email." };
}

export async function signInWithGoogle(form: FormData) {
  const next = safeNext(form.get("next"));
  const supabase = await createClient();
  const base = await siteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${base}/auth/callback?next=${encodeURIComponent(next)}` },
  });

  if (error || !data.url) redirect(`/login?error=google&next=${encodeURIComponent(next)}`);
  redirect(data.url);
}
