"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type UploadedImage = { url: string; path: string; caption: string | null };

const BUCKET = "portfolio";
const MAX_MB = 10;

export async function uploadFile(file: File, folder: string): Promise<UploadedImage> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path, caption: null };
}

/**
 * Multi-image uploader with captions and ordering.
 * Files go straight from the browser to Supabase Storage (only the owner is allowed to upload).
 * The first image is used as the project's cover.
 */
export default function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(`${f.name} is larger than ${MAX_MB} MB and was skipped.`);
        return false;
      }
      return true;
    });

    setBusy(list.length);
    const added: UploadedImage[] = [];
    for (const file of list) {
      try {
        added.push(await uploadFile(file, "projects"));
      } catch (e) {
        setError(`Upload failed for ${file.name}: ${(e as Error).message}`);
      }
      setBusy((b) => b - 1);
    }
    onChange([...images, ...added]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

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
        <p>Drag images here, or</p>
        <button type="button" className="btn-outline !py-1.5" onClick={() => inputRef.current?.click()}>
          Choose files
        </button>
        <p className="text-xs text-muted">JPG, PNG or WebP · up to {MAX_MB} MB each · the first image is the cover</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {busy > 0 && <p className="mt-3 text-sm text-muted">Uploading {busy} image(s)…</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {images.length > 0 && (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.path} className="overflow-hidden rounded-lg border border-line bg-panel">
              <div className="relative aspect-[4/3] bg-line">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-xs text-paper">Cover</span>
                )}
              </div>
              <div className="space-y-2 p-3">
                <input
                  className="input !py-1.5 text-xs"
                  placeholder="Caption (optional)"
                  value={img.caption ?? ""}
                  onChange={(e) => {
                    const next = [...images];
                    next[i] = { ...img, caption: e.target.value };
                    onChange(next);
                  }}
                />
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-3">
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="disabled:opacity-30">
                      ← Earlier
                    </button>
                    <button
                      type="button"
                      disabled={i === images.length - 1}
                      onClick={() => move(i, 1)}
                      className="disabled:opacity-30"
                    >
                      Later →
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-red-700"
                    onClick={() => onChange(images.filter((_, k) => k !== i))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
