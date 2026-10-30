"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import FormMessage from "@/components/FormMessage";
import MediaUploader, { type UploadedMedia } from "@/components/MediaUploader";
import ProjectDetailFields from "@/components/ProjectDetailFields";
import { VISIBILITY_HELP, VISIBILITY_LABELS } from "@/lib/constants";
import type { Architect, Project, Visibility } from "@/lib/types";
import { saveProject } from "./actions";

type Credit = { architect_id: string; credit_role: string; can_edit: boolean; can_upload: boolean };

export default function ProjectForm({ project, architects }: { project?: Project; architects: Architect[] }) {
  const [state, action, pending] = useActionState(saveProject, undefined);
  const [, startTransition] = useTransition();

  const [visibility, setVisibility] = useState<Visibility>(project?.visibility ?? "draft");
  const [isShared, setIsShared] = useState(project?.is_shared ?? false);
  const [media, setMedia] = useState<UploadedMedia[]>(
    (project?.project_media ?? []).map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
      path: m.path,
      file_name: m.file_name,
      mime_type: m.mime_type,
      caption: m.caption,
    }))
  );
  const [credits, setCredits] = useState<Credit[]>(
    (project?.project_collaborators ?? []).map((c) => ({
      architect_id: c.architect_id,
      credit_role: c.credit_role ?? "",
      can_edit: c.can_edit ?? false,
      can_upload: c.can_upload ?? false,
    }))
  );

  const linked = new Set(architects.filter((a) => a.profile_id).map((a) => a.id));
  const updateCredit = (i: number, patch: Partial<Credit>) =>
    setCredits((cs) => cs.map((c, k) => (k === i ? { ...c, ...patch } : c)));

  return (
    <form
      onSubmit={(e) => {
        // onSubmit (not the action prop) keeps typed text if the server returns an error.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-8"
    >
      {project && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="media" value={JSON.stringify(media)} />
      <input type="hidden" name="credits" value={JSON.stringify(credits.filter((c) => c.architect_id))} />

      {/* FR-017 visibility */}
      <section className="rounded-lg border border-line bg-panel p-6">
        <p className="label">Visibility</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {(Object.keys(VISIBILITY_LABELS) as Visibility[]).map((v) => (
            <label
              key={v}
              className={`cursor-pointer rounded-lg border p-4 text-sm transition ${
                visibility === v ? "border-ink bg-paper" : "border-line hover:border-ink/40"
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value={v}
                checked={visibility === v}
                onChange={() => setVisibility(v)}
                className="sr-only"
              />
              <span className="font-medium">{VISIBILITY_LABELS[v]}</span>
              <span className="mt-1 block text-xs text-muted">{VISIBILITY_HELP[v]}</span>
            </label>
          ))}
        </div>
        <label className={`mt-4 flex items-center gap-3 text-sm ${visibility !== "public" ? "opacity-40" : ""}`}>
          <input
            type="checkbox"
            name="featured"
            disabled={visibility !== "public"}
            defaultChecked={project?.featured ?? false}
            className="h-4 w-4"
          />
          Feature on the home page
        </label>
      </section>

      <ProjectDetailFields project={project} />

      <section className="rounded-lg border border-line bg-panel p-6">
        <h2 className="label !text-sm">Images, drawings & documents</h2>
        <div className="mt-3">
          <MediaUploader media={media} onChange={setMedia} />
        </div>
      </section>

      {/* FR-019 shared external project */}
      <section className="space-y-4 rounded-lg border border-line bg-panel p-6">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            name="is_shared"
            checked={isShared}
            onChange={(e) => setIsShared(e.target.checked)}
            className="h-4 w-4"
          />
          This is another architect&apos;s project that I&apos;m sharing
        </label>
        {isShared && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="original_architect_id">Original architect *</label>
              <select
                id="original_architect_id"
                name="original_architect_id"
                defaultValue={project?.original_architect_id ?? ""}
                className="input"
              >
                <option value="">— New architect (type name →) —</option>
                {architects.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="original_architect_name">…or add a new architect</label>
              <input id="original_architect_name" name="original_architect_name" placeholder="Full name" className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="source_url">Link to the original (optional)</label>
              <input id="source_url" name="source_url" defaultValue={project?.source_url ?? ""} className="input" />
            </div>
          </div>
        )}
      </section>

      {/* FR-020 / FR-021 credits and per-project permissions */}
      <section className="rounded-lg border border-line bg-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="label !mb-0 !text-sm">Credits & collaborators</h2>
          <Link href="/dashboard/collaborators" className="text-xs underline">
            Manage architects
          </Link>
        </div>
        {architects.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Add architects on the <Link href="/dashboard/collaborators" className="underline">Collaborators</Link> page first.
          </p>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {credits.map((c, i) => (
                <li key={i} className="grid items-center gap-3 rounded-md border border-line p-3 sm:grid-cols-[1fr_1fr_auto]">
                  <select
                    value={c.architect_id}
                    onChange={(e) => updateCredit(i, { architect_id: e.target.value })}
                    className="input"
                    aria-label="Architect"
                  >
                    <option value="">Choose architect…</option>
                    {architects.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                        {a.profile_id ? " (has account)" : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    value={c.credit_role}
                    onChange={(e) => updateCredit(i, { credit_role: e.target.value })}
                    placeholder="Role, e.g. Co-designer"
                    className="input"
                    aria-label="Credited role"
                  />
                  <button
                    type="button"
                    onClick={() => setCredits((cs) => cs.filter((_, k) => k !== i))}
                    className="text-sm text-red-700"
                  >
                    Remove
                  </button>
                  {linked.has(c.architect_id) && (
                    <div className="flex flex-wrap gap-5 text-xs sm:col-span-3">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={c.can_edit} onChange={(e) => updateCredit(i, { can_edit: e.target.checked })} />
                        Can edit details
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={c.can_upload}
                          onChange={(e) => updateCredit(i, { can_upload: e.target.checked })}
                        />
                        Can upload media
                      </label>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setCredits((cs) => [...cs, { architect_id: "", credit_role: "", can_edit: false, can_upload: false }])}
              className="btn-outline mt-4 !py-1.5"
            >
              + Add credit
            </button>
          </>
        )}
      </section>

      <section className="grid gap-5 rounded-lg border border-line bg-panel p-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="slug">Web address</label>
          <div className="flex items-center gap-1 text-sm text-muted">
            /projects/
            <input id="slug" name="slug" defaultValue={project?.slug ?? ""} placeholder="auto from title" className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="sort_order">Order</label>
          <input id="sort_order" name="sort_order" type="number" defaultValue={project?.sort_order ?? 0} className="input" />
          <p className="mt-1 text-xs text-muted">Lower numbers appear first.</p>
        </div>
      </section>

      <FormMessage state={state} />
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn">
          {pending ? "Saving…" : project ? "Save changes" : "Create project"}
        </button>
        <Link href="/dashboard/projects" className="text-sm text-muted hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
