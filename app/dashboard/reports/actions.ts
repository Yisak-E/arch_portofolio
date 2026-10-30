"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { BUCKET } from "@/lib/constants";
import { nullable, str } from "@/lib/utils";

/** FR-038: dismiss, hide the project (→ Private) or delete it. */
export async function resolveReport(form: FormData) {
  const { supabase, user } = await requireStaff();
  const id = str(form, "id", 64);
  const decision = str(form, "decision", 20);
  const note = nullable(str(form, "note", 1000));

  const { data: report } = await supabase.from("reports").select("project_id").eq("id", id).single();
  if (!report) return;

  if (decision === "hide") {
    await supabase.from("projects").update({ visibility: "private", featured: false }).eq("id", report.project_id);
  }

  await supabase
    .from("reports")
    .update({
      status: decision === "dismiss" ? "dismissed" : "resolved",
      resolution_note: note ?? (decision === "hide" ? "Project hidden (set to Private)" : null),
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (decision === "delete") {
    // Deleting the project also deletes its reports (cascade), which the audit log records.
    const { data: files } = await supabase.from("project_media").select("path").eq("project_id", report.project_id);
    const { error } = await supabase.from("projects").delete().eq("id", report.project_id);
    if (!error && files?.length) await supabase.storage.from(BUCKET).remove(files.map((f) => f.path));
  }

  revalidatePath("/", "layout");
}
