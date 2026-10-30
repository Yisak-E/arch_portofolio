"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { friendlyError, requireStaff } from "@/lib/auth";
import { BUCKET, VISIBILITY_LABELS } from "@/lib/constants";
import { coverFrom, parseDetails, parseMedia, syncMedia } from "@/lib/project-save";
import type { ActionState } from "@/lib/types";
import { slugify, str } from "@/lib/utils";

type CreditInput = {
  architect_id: string;
  credit_role: string | null;
  can_edit: boolean;
  can_upload: boolean;
};

function parseCredits(raw: string): CreditInput[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    const seen = new Set<string>();
    return arr
      .filter((c) => typeof c?.architect_id === "string" && c.architect_id && !seen.has(c.architect_id) && seen.add(c.architect_id))
      .map((c) => ({
        architect_id: c.architect_id,
        credit_role: typeof c.credit_role === "string" && c.credit_role.trim() ? c.credit_role.trim().slice(0, 120) : null,
        can_edit: !!c.can_edit,
        can_upload: !!c.can_upload,
      }));
  } catch {
    return [];
  }
}

function url(v: string) {
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** FR-013, FR-014, FR-016..FR-020 */
export async function saveProject(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();

  const parsed = parseDetails(form);
  if ("error" in parsed) return { error: parsed.error };

  const id = str(form, "id", 64) || null;
  const media = parseMedia(str(form, "media", 200_000));
  const credits = parseCredits(str(form, "credits", 50_000));

  const visibility = str(form, "visibility", 10);
  if (!(visibility in VISIBILITY_LABELS)) return { error: "Choose a visibility." };

  // FR-019: shared project needs an original architect (existing, or create a new card by name).
  const isShared = form.get("is_shared") === "on";
  let originalArchitectId: string | null = null;
  if (isShared) {
    originalArchitectId = str(form, "original_architect_id", 64) || null;
    const newName = str(form, "original_architect_name", 120);
    if (!originalArchitectId && newName) {
      const { data, error } = await supabase.from("architects").insert({ name: newName }).select("id").single();
      if (error) return { error: friendlyError(error.message) };
      originalArchitectId = data.id;
    }
    if (!originalArchitectId) return { error: "A shared project needs the original architect's name." };
  }

  let slug = slugify(str(form, "slug", 80) || parsed.row.title) || "project";
  const { data: clash } = await supabase.from("projects").select("id").eq("slug", slug).maybeSingle();
  if (clash && clash.id !== id) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const row = {
    ...parsed.row,
    slug,
    visibility,
    // Drafts and private work never appear on the home page.
    featured: visibility === "public" && form.get("featured") === "on",
    is_shared: isShared,
    original_architect_id: originalArchitectId,
    source_url: isShared ? url(str(form, "source_url", 500)) : null,
    sort_order: Number(str(form, "sort_order", 6)) || 0,
    cover_url: coverFrom(media),
  };

  let projectId = id;
  if (id) {
    const { error } = await supabase.from("projects").update(row).eq("id", id);
    if (error) return { error: friendlyError(error.message) };
  } else {
    const { data, error } = await supabase.from("projects").insert(row).select("id").single();
    if (error) return { error: friendlyError(error.message) };
    projectId = data.id;
  }

  const mediaError = await syncMedia(supabase, projectId!, media);
  if (mediaError) return { error: `Project saved, but media failed: ${friendlyError(mediaError)}` };

  // Credits: replace the list, keeping order (FR-020/021).
  const { data: oldCredits } = await supabase.from("project_collaborators").select("architect_id").eq("project_id", projectId!);
  const keep = new Set(credits.map((c) => c.architect_id));
  const toDelete = (oldCredits ?? []).map((c) => c.architect_id).filter((a) => !keep.has(a));
  if (toDelete.length) {
    await supabase.from("project_collaborators").delete().eq("project_id", projectId!).in("architect_id", toDelete);
  }
  const existing = new Set((oldCredits ?? []).map((c) => c.architect_id));
  for (const [i, c] of credits.entries()) {
    const fields = { ...c, sort_order: i };
    const { error } = existing.has(c.architect_id)
      ? await supabase.from("project_collaborators").update(fields).eq("project_id", projectId!).eq("architect_id", c.architect_id)
      : await supabase.from("project_collaborators").insert({ ...fields, project_id: projectId });
    if (error) return { error: `Project saved, but credits failed: ${friendlyError(error.message)}` };
  }

  revalidatePath("/", "layout");
  redirect(`/dashboard/projects?saved=${encodeURIComponent(parsed.row.title)}`);
}

/** FR-015 */
export async function deleteProject(form: FormData) {
  const { supabase } = await requireStaff();
  const id = str(form, "id", 64);
  if (!id) return;

  const { data: files } = await supabase.from("project_media").select("path").eq("project_id", id);
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (!error && files?.length) await supabase.storage.from(BUCKET).remove(files.map((f) => f.path));

  revalidatePath("/", "layout");
}

/** FR-017: quick visibility change from the list. */
export async function setVisibility(form: FormData) {
  const { supabase } = await requireStaff();
  const visibility = str(form, "visibility", 10);
  if (!(visibility in VISIBILITY_LABELS)) return;
  const patch: Record<string, unknown> = { visibility };
  if (visibility !== "public") patch.featured = false;
  await supabase.from("projects").update(patch).eq("id", str(form, "id", 64));
  revalidatePath("/", "layout");
}

