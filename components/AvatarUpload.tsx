"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { uploadFile } from "@/components/MediaUploader";

/** Single-image picker that uploads to Storage and writes the URL into a hidden input. */
export default function AvatarUpload({
  name,
  folder,
  initialUrl,
  label = "Picture",
}: {
  name: string;
  folder: string;
  initialUrl: string | null;
  label?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-5">
      <input type="hidden" name={name} value={url} />
      <div className="h-20 w-20 overflow-hidden rounded-full bg-line">
        {url && <img src={url} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="space-y-1">
        <p className="label !mb-0">{label}</p>
        <div className="flex gap-3 text-sm">
          <button type="button" className="btn-outline !py-1.5" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? "Uploading…" : url ? "Replace" : "Upload"}
          </button>
          {url && (
            <button type="button" className="text-red-700" onClick={() => setUrl("")}>
              Remove
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError(null);
          try {
            setUrl((await uploadFile(file, folder)).url);
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
