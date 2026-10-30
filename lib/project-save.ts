import type { createClient } from "./supabase/server";
import { BUCKET, STATUS_LABELS } from "./constants";
import type { MediaKind } from "./types";
import { nullable, str } from "./utils";

/** Descriptive fields editable by the owner and by collaborators with "can edit". */
export function parseDetails(form: FormData) {
  const title = str(form, "title", 200);
  if (!title) return { error: "Please give the project a title." };

  const yearRaw = str(form, "year", 4);
  const year = yearRaw ? Number(yearRaw) : null;
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2100)) {
    return { error: "Year should be a 4-digit year." };
  }

  const status = str(form, "status", 20);
  const tags = str(form, "tags", 1000)
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 20);

  return {
    row: {
      title,
      summary: nullable(str(form, "summary", 400)),
      description: nullable(str(form, "description", 20_000)),
      design_concept: nullable(str(form, "design_concept", 10_000)),
      materials: nullable(str(form, "materials", 2000)),
      software: nullable(str(form, "software", 200)),
      category: nullable(str(form, "category", 80)),
      tags: [...new Set(tags)],
      location: nullable(str(form, "location", 120)),
      year,
      area: nullable(str(form, "area", 60)),
      status: status in STATUS_LABELS ? status : "completed",
    },
  };
}

type IncomingMedia = {
  id?: string;
  kind: MediaKind;
  url: string;
  path: string;
  file_name: string | null;
  mime_type: string | null;
  caption: string | null;
};

export function parseMedia(raw: string): IncomingMedia[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((m) => typeof m?.url === "string" && typeof m?.path === "string")
      .map((m) => ({
        id: typeof m.id === "string" ? m.id : undefined,
        kind: (["image", "drawing", "document"] as const).includes(m.kind) ? m.kind : "image",
        url: m.url,
        path: m.path,
        file_name: typeof m.file_name === "string" ? m.file_name.slice(0, 200) : null,
        mime_type: typeof m.mime_type === "string" ? m.mime_type.slice(0, 100) : null,
        caption: typeof m.caption === "string" && m.caption.trim() ? m.caption.trim().slice(0, 300) : null,
      }));
  } catch {
    return [];
  }
}

/**
 * Bring project_media in line with the submitted list: update kept rows, insert new ones,
 * delete removed ones (and their files). With `onlyUploadedBy`, only that user's files are touched.
 */
export async function syncMedia(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  incoming: IncomingMedia[],
  opts: { onlyUploadedBy?: string; sortOffset?: number } = {}
) {
  let q = supabase.from("project_media").select("id, path").eq("project_id", projectId);
  if (opts.onlyUploadedBy) q = q.eq("uploaded_by", opts.onlyUploadedBy);
  const { data: existing, error: readError } = await q;
  if (readError) return readError.message;

  const keepIds = new Set(incoming.map((m) => m.id).filter(Boolean));
  const removed = (existing ?? []).filter((e) => !keepIds.has(e.id));

  if (removed.length) {
    const { error } = await supabase.from("project_media").delete().in("id", removed.map((r) => r.id));
    if (error) return error.message;
    await supabase.storage.from(BUCKET).remove(removed.map((r) => r.path));
  }

  const offset = opts.sortOffset ?? 0;
  for (const [i, m] of incoming.entries()) {
    const fields = { kind: m.kind, caption: m.caption, sort_order: offset + i };
    if (m.id) {
      const { error } = await supabase.from("project_media").update(fields).eq("id", m.id).eq("project_id", projectId);
      if (error) return error.message;
    } else {
      const { error } = await supabase.from("project_media").insert({
        ...fields,
        project_id: projectId,
        url: m.url,
        path: m.path,
        file_name: m.file_name,
        mime_type: m.mime_type,
      });
      if (error) return error.message;
    }
  }
  return null;
}

/** First image/drawing (not a PDF) becomes the cover. */
export function coverFrom(media: IncomingMedia[]) {
  return media.find((m) => m.kind !== "document" && !m.mime_type?.includes("pdf"))?.url ?? null;
}
