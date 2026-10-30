"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { BUCKET, MEDIA_KIND_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { MediaKind } from "@/lib/types";

export type UploadedMedia = {
  id?: string;
  kind: MediaKind;
  url: string;
  path: string;
  file_name: string | null;
  mime_type: string | null;
  caption: string | null;
  /** false for files someone else uploaded that this user may not edit */
  editable?: boolean;
};

const MAX_MB = 25;

export async function uploadFile(file: File, folder: string) {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/**
 * FR-016 / FR-029: images, drawings/blueprints and PDF documents with captions and ordering.
 * Files go straight from the browser to Supabase Storage; storage policies decide who may upload.
 * The first image is used as the project's cover.
 */
export default function MediaUploader({
  media,
  onChange,
  folder = "projects",
}: {
  media: UploadedMedia[];
  onChange: (media: UploadedMedia[]) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files).filter((f) => {
      const ok = f.type.startsWith("image/") || f.type === "application/pdf";
      if (!ok) setError(`${f.name}: only images and PDFs are allowed.`);
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(`${f.name} is larger than ${MAX_MB} MB and was skipped.`);
        return false;
      }
      return ok;
    });

    setBusy(list.length);
    const added: UploadedMedia[] = [];
    for (const file of list) {
      try {
        const { url, path } = await uploadFile(file, folder);
        added.push({
          kind: file.type === "application/pdf" ? "document" : "image",
          url,
          path,
          file_name: file.name,
          mime_type: file.type,
          caption: null,
          editable: true,
        });
      } catch (e) {
        setError(`Upload failed for ${file.name}: ${(e as Error).message}`);
      }
      setBusy((b) => b - 1);
    }
    onChange([...media, ...added]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function update(i: number, patch: Partial<UploadedMedia>) {
    const next = [...media];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= media.length) return;
    const next = [...media];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  const coverIndex = media.findIndex((m) => m.kind !== "document" && !m.mime_type?.includes("pdf"));

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-paper px-4 py-8 text-center text-sm"
      >
        <p>Drag images, drawings or PDFs here, or</p>
        <button type="button" className="btn-outline !py-1.5" onClick={() => inputRef.current?.click()}>
          Choose files
        </button>
        <p className="text-xs text-muted">JPG, PNG, WebP or PDF · up to {MAX_MB} MB each · the first image is the cover</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {busy > 0 && <p className="mt-3 text-sm text-muted">Uploading {busy} file(s)…</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {media.length > 0 && (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((m, i) => {
            const isPdf = m.mime_type?.includes("pdf") || m.url.toLowerCase().endsWith(".pdf");
            const editable = m.editable !== false;
            return (
              <li key={m.path} className="overflow-hidden rounded-lg border border-line bg-panel">
                <div className="relative aspect-[4/3] bg-line">
                  {isPdf ? (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-sm text-muted">
                      <span className="font-serif text-2xl text-ink">PDF</span>
                      <span className="max-w-[90%] truncate">{m.file_name}</span>
                    </div>
                  ) : (
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  )}
                  {i === coverIndex && (
                    <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-xs text-paper">Cover</span>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <select
                    className="input !py-1.5 text-xs"
                    value={m.kind}
                    disabled={!editable}
                    onChange={(e) => update(i, { kind: e.target.value as MediaKind })}
                  >
                    {Object.entries(MEDIA_KIND_LABELS)
                      .filter(([k]) => !isPdf || k !== "image")
                      .map(([k, l]) => (
                        <option key={k} value={k}>
                          {l}
                        </option>
                      ))}
                  </select>
                  <input
                    className="input !py-1.5 text-xs"
                    placeholder="Caption (optional)"
                    value={m.caption ?? ""}
                    disabled={!editable}
                    onChange={(e) => update(i, { caption: e.target.value })}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex gap-3">
                      <button type="button" disabled={i === 0 || !editable} onClick={() => move(i, -1)} className="disabled:opacity-30">
                        ← Earlier
                      </button>
                      <button
                        type="button"
                        disabled={i === media.length - 1 || !editable}
                        onClick={() => move(i, 1)}
                        className="disabled:opacity-30"
                      >
                        Later →
                      </button>
                    </div>
                    {editable ? (
                      <button type="button" className="text-red-700" onClick={() => onChange(media.filter((_, k) => k !== i))}>
                        Remove
                      </button>
                    ) : (
                      <span className="text-muted">Added by owner</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
