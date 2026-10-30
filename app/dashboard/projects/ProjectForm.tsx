"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import FormMessage from "@/components/FormMessage";
import ImageUploader, { type UploadedImage } from "@/components/ImageUploader";
import type { Project } from "@/lib/types";
import { saveProject } from "./actions";

const CATEGORIES = ["Residential", "Public building", "Urban design", "Interior", "Landscape", "Competition", "Studio project", "Thesis"];

export default function ProjectForm({ project }: { project?: Project }) {
  const [state, action, pending] = useActionState(saveProject, undefined);
  const [, startTransition] = useTransition();
  const [images, setImages] = useState<UploadedImage[]>(
    (project?.project_images ?? []).map((i) => ({ url: i.url, path: i.path, caption: i.caption }))
  );

  // Submitting via onSubmit (not the `action` prop) stops React from clearing
  // the fields if the server returns a validation error.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {project && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <section className="space-y-5 rounded-lg border border-line bg-panel p-6">
        <div>
          <label className="label" htmlFor="title">Title *</label>
          <input id="title" name="title" required defaultValue={project?.title} className="input text-base" />
        </div>
        <div>
          <label className="label" htmlFor="summary">Short summary</label>
          <input
            id="summary"
            name="summary"
            maxLength={400}
            defaultValue={project?.summary ?? ""}
            placeholder="One or two lines shown on the project card"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={10}
            defaultValue={project?.description ?? ""}
            placeholder="Concept, site, programme, process, materials… Line breaks are kept."
            className="input leading-7"
          />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-panel p-6">
        <h2 className="label !text-sm">Images & drawings</h2>
        <div className="mt-3">
          <ImageUploader images={images} onChange={setImages} />
        </div>
      </section>

      <section className="grid gap-5 rounded-lg border border-line bg-panel p-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="category">Category</label>
          <input id="category" name="category" list="categories" defaultValue={project?.category ?? ""} className="input" />
          <datalist id="categories">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="year">Year</label>
          <input id="year" name="year" inputMode="numeric" maxLength={4} defaultValue={project?.year ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="location">Location</label>
          <input id="location" name="location" defaultValue={project?.location ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="area">Area / scale</label>
          <input id="area" name="area" placeholder="e.g. 1,200 m²" defaultValue={project?.area ?? ""} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="software">Tools & software</label>
          <input
            id="software"
            name="software"
            placeholder="e.g. Revit, Rhino, Lumion, hand drawing"
            defaultValue={project?.software ?? ""}
            className="input"
          />
        </div>
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
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="published" defaultChecked={project?.published ?? false} className="h-4 w-4" />
          Published — visible to everyone
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} className="h-4 w-4" />
          Featured on the home page
        </label>
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
