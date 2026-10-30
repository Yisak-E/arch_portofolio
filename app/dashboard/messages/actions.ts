"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { str } from "@/lib/utils";

export async function setRead(form: FormData) {
  const { supabase } = await requireOwner();
  await supabase
    .from("messages")
    .update({ is_read: form.get("is_read") === "true" })
    .eq("id", str(form, "id", 64));
  revalidatePath("/dashboard", "layout");
}

export async function deleteMessage(form: FormData) {
  const { supabase } = await requireOwner();
  await supabase.from("messages").delete().eq("id", str(form, "id", 64));
  revalidatePath("/dashboard", "layout");
}
