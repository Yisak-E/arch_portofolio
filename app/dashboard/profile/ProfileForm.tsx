"use client";

/* eslint-disable @next/next/no-img-element */
import { useActionState, useRef, useState, useTransition } from "react";
import FormMessage from "@/components/FormMessage";
import { uploadFile } from "@/components/ImageUploader";
import type { SiteProfile } from "@/lib/types";
import { saveProfile } from "./actions";

export default function ProfileForm({ profile }: { profile: SiteProfile }) {
  const [state, action, pending] = useActionState(saveProfile, undefined);
  const [, startTransition] = useTransition();
  const [avatar, setAvatar] = useState({ url: profile.avatar_url ?? "", path: profile.avatar_path ?? "" });
  const [cvUrl, setCvUrl] = useState(profile.cv_url ?? "");
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const cvInput = useRef<HTMLInputElement>(null);

  async function upload(file: File | undefined, kind: "avatar" | "cv") {
    if (!file) return;
    setUploadError(null);
    setUploading(kind);
    try {
      const res = await uploadFile(file, kind === "avatar" ? "profile" : "cv");
      if (kind === "avatar") setAvatar({ url: res.url, path: res.path });
      else setCvUrl(res.url);
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(null);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-8"
    >
      <input type="hidden" name="avatar_url" value={avatar.url} />
      <input type="hidden" name="avatar_path" value={avatar.path} />

      <section className="flex flex-wrap items-center gap-6 rounded-lg border border-line bg-panel p-6">
        <div className="h-28 w-24 overflow-hidden rounded bg-line">
          {avatar.url && <img src={avatar.url} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="space-y-2">
          <p className="label !mb-0">Portrait</p>
          <div className="flex gap-3">
            <button type="button" className="btn-outline !py-1.5" onClick={() => avatarInput.current?.click()}>
              {uploading === "avatar" ? "Uploading…" : avatar.url ? "Replace" : "Upload"}
            </button>
            {avatar.url && (
              <button type="button" className="text-sm text-red-700" onClick={() => setAvatar({ url: "", path: "" })}>
                Remove
              </button>
            )}
          </div>
          <input
            ref={avatarInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => upload(e.target.files?.[0], "avatar")}
          />
        </div>
      </section>

      <section className="grid gap-5 rounded-lg border border-line bg-panel p-6 sm:grid-cols-2">
        <Field label="Full name *" name="full_name" defaultValue={profile.full_name} required />
        <Field label="Headline" name="headline" defaultValue={profile.headline} placeholder="Architecture student at …" />
        <div className="sm:col-span-2">
          <label className="label" htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" rows={8} defaultValue={profile.bio ?? ""} className="input leading-7" />
        </div>
        <Field label="Based in" name="location" defaultValue={profile.location} />
        <div>
          <label className="label" htmlFor="education">Education</label>
          <textarea id="education" name="education" rows={3} defaultValue={profile.education ?? ""} className="input" />
        </div>
      </section>

      <section className="grid gap-5 rounded-lg border border-line bg-panel p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="cv_url">CV (PDF)</label>
          <div className="flex gap-3">
            <input
              id="cv_url"
              name="cv_url"
              value={cvUrl}
              onChange={(e) => setCvUrl(e.target.value)}
              placeholder="Upload a PDF or paste a link"
              className="input"
            />
            <button type="button" className="btn-outline shrink-0 !py-1.5" onClick={() => cvInput.current?.click()}>
              {uploading === "cv" ? "Uploading…" : "Upload PDF"}
            </button>
          </div>
          <input
            ref={cvInput}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => upload(e.target.files?.[0], "cv")}
          />
        </div>
        <Field label="Instagram link" name="instagram_url" defaultValue={profile.instagram_url} />
        <Field label="LinkedIn link" name="linkedin_url" defaultValue={profile.linkedin_url} />
      </section>

      {uploadError && <p className="text-sm text-red-700">Upload failed: {uploadError}</p>}
      <FormMessage state={state} />
      <button type="submit" disabled={pending || uploading !== null} className="btn">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string | null;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        className="input"
      />
    </div>
  );
}
