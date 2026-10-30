"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";
import { nullable, str } from "@/lib/utils";

/** FR-033: staff update status and leave a note; the client is notified by a database trigger. */
export async function updateRequest(form: FormData) {
  const { supabase } = await requireStaff();
  const status = str(form, "status", 20);
  if (!(status in REQUEST_STATUS_LABELS)) return;
  await supabase
    .from("collaboration_requests")
    .update({ status, owner_note: nullable(str(form, "owner_note", 2000)) })
    .eq("id", str(form, "id", 64));
  revalidatePath("/dashboard", "layout");
}

export async function deleteRequest(form: FormData) {
  const { supabase } = await requireStaff();
  await supabase.from("collaboration_requests").delete().eq("id", str(form, "id", 64));
  revalidatePath("/dashboard", "layout");
}
