"use server";

import { revalidatePath } from "next/cache";
import { friendlyError, requireStaff } from "@/lib/auth";
import type { ActionState } from "@/lib/types";
import { str } from "@/lib/utils";

/** FR-037: role and suspension changes go through checked database functions. */
export async function setRole(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const { error } = await supabase.rpc("admin_set_user_role", {
    p_user: str(form, "id", 64),
    p_role: str(form, "role", 20),
  });
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/dashboard/users");
  return { success: "Role updated." };
}

export async function setSuspended(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const suspend = form.get("suspend") === "true";
  const { error } = await supabase.rpc("admin_set_user_suspended", {
    p_user: str(form, "id", 64),
    p_suspended: suspend,
  });
  if (error) return { error: friendlyError(error.message) };
  revalidatePath("/dashboard/users");
  return { success: suspend ? "Account suspended." : "Account reactivated." };
}
