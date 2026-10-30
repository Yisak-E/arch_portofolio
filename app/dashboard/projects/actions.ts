"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import type { ActionState, ProjectImage } from "@/lib/types";
import { nullable, slugify, str } from "@/lib/utils";

const BUCKET = "portfolio";

function parseImages(raw: string): ProjectImage[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((i) => typeof i?.url === "string" && typeof i?.path === "string")
      .map((i, idx) => ({
        url: i.url,
        path: i.path,
        caption: typeof i.caption === "string" && i.caption.trim() ? i.caption.trim().slice(0, 300) : null,
        sort_order: idx,
      }));
  } catch {
    return [];
  }
}

export async function saveProject(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireOwner();

  const id = str(form, "id", 64) || null;
  const title = str(form, "title", 200);
  if (!title) return { error: "Please give the project a title." };

  const yearRaw = str(form, "year", 4);
  const year = yearRaw ? Number(yearRaw) : null;
  if (year !== null && (Number.isNaN(year) || year < 1900 || year > 2100)) {
    return { error: "Year should be a 4-digit year." };
  }

  const images = parseImages(str(form, "images", 100_000));

  // Unique, URL-friendly slug.
  let slug = slugify(str(form, "slug", 80) || title) || "project";
  const { data: clash } = await supabase.from("projects").select("id").eq("slug", slug).maybeSingle();
  if (clash && clash.id !== id) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const row = {
    title,
    slug,
    summary: nullable(str(form, "summary", 400)),
    description: nullable(str(form, "description", 20_000)),
    category: nullable(str(form, "category", 80)),
    location: nullable(str(form, "location", 120)),
    year,
    area: nullable(str(form, "area", 60)),
    software: nullable(str(form, "software", 200)),
    published: form.get("published") === "on",
    featured: form.get("featured") === "on",
    sort_order: Number(str(form, "sort_order", 6)) || 0,
    cover_url: images[0]?.url ?? null,
    updated_at: new Date().toISOString(),
  };

  let projectId = id;
  let oldPaths: string[] = [];

  if (id) {
    const { data: old } = await supabase.from("project_images").select("path").eq("project_id", id);
    oldPaths = (old ?? []).map((o) => o.path);
    const { error } = await supabase.from("projects").update(row).eq("id", id);
    if (error) return { error: error.message };
    await supabase.from("project_images").delete().eq("project_id", id);
  } else {
    const { data, error } = await supabase.from("projects").insert(row).select("id").single();
    if (error) return { error: error.message };
    projectId = data.id;
  }

  if (images.length) {
    const { error } = await supabase
      .from("project_images")
      .insert(images.map((img) => ({ ...img, project_id: projectId })));
    if (error) return { error: `Project saved, but images failed: ${error.message}` };
  }

  // Delete files that were removed from the project.
  const keep = new Set(images.map((i) => i.path));
  const orphans = oldPaths.filter((p) => !keep.has(p));
  if (orphans.length) await supabase.storage.from(BUCKET).remove(orphans);

  revalidatePath("/", "layout");
  redirect(`/dashboard/projects?saved=${encodeURIComponent(title)}`);
}

export async function deleteProject(form: FormData) {
  const { supabase } = await requireOwner();
  const id = str(form, "id", 64);
  if (!id) return;

  const { data: imgs } = await supabase.from("project_images").select("path").eq("project_id", id);
  await supabase.from("projects").delete().eq("id", id);
  const paths = (imgs ?? []).map((i) => i.path);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);

  revalidatePath("/", "layout");
}

export async function togglePublished(form: FormData) {
  const { supabase } = await requireOwner();
  const id = str(form, "id", 64);
  const published = form.get("published") === "true";
  await supabase.from("projects").update({ published, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/", "layout");
}
