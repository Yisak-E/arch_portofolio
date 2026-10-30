"use client";

import { useActionState, useState, useTransition } from "react";
import FormMessage from "@/components/FormMessage";
import MediaUploader, { type UploadedMedia } from "@/components/MediaUploader";
import ProjectDetailFields from "@/components/ProjectDetailFields";
import type { Project } from "@/lib/types";
import { saveCollaboratorProject } from "./actions";

export default function CollaboratorProjectForm({
  project,
  canEdit,
  canUpload,
  userId,
}: {
  project: Project;
  canEdit: boolean;
  canUpload: boolean;
  userId: string;
}) {
  const [state, action, pending] = useActionState(saveCollaboratorProject, undefined);
  const [, startTransition] = useTransition();
  const [media, setMedia] = useState<UploadedMedia[]>(
    (project.project_media ?? []).map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
      path: m.path,
      file_name: m.file_name,
      mime_type: m.mime_type,
      caption: m.caption,
      editable: m.uploaded_by === userId,
    }))
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-8"
    >
      <input type="hidden" name="id" value={project.id} />
      <input type="hidden" name="media" value={JSON.stringify(media.filter((m) => m.editable !== false))} />
      <input type="hidden" name="can_edit" value={String(canEdit)} />
      <input type="hidden" name="can_upload" value={String(canUpload)} />

      {canEdit && <ProjectDetailFields project={project} />}

      {canUpload && (
        <section className="rounded-lg border border-line bg-panel p-6">
          <h2 className="label !text-sm">Images, drawings & documents</h2>
          <p className="mb-3 text-xs text-muted">You can edit or remove the files you uploaded.</p>
          <MediaUploader media={media} onChange={setMedia} />
        </section>
      )}

      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="btn">
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
