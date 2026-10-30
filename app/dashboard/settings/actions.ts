"use server";

import { requireOwner } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

export async function changePassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireOwner();
  const password = str(form, "password", 200);
  const confirm = str(form, "confirm", 200);

  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== confirm) return { error: "The two passwords don't match." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: "Password updated." };
}
