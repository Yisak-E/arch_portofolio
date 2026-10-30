import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { Project } from "@/lib/types";
import CollaboratorProjectForm from "./CollaboratorProjectForm";

/** FR-028 / FR-029: edit details and media according to granted permissions. */
export default async function CollaboratorProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser(`/account/projects/${id}`);

  const { data: architect } = await supabase.from("architects").select("id").eq("profile_id", user.id).maybeSingle();
  if (!architect) notFound();

  const [{ data: credit }, { data: project }] = await Promise.all([
    supabase
      .from("project_collaborators")
      .select("can_edit, can_upload")
      .eq("project_id", id)
      .eq("architect_id", architect.id)
      .maybeSingle(),
    supabase
      .from("projects")
      .select("*, project_media(*)")
      .eq("id", id)
      .order("sort_order", { referencedTable: "project_media" })
      .maybeSingle(),
  ]);
  if (!credit || !project || (!credit.can_edit && !credit.can_upload)) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/account/projects" className="text-sm text-muted hover:text-ink">
        ← My projects
      </Link>
      <h1 className="mt-4 font-serif text-3xl">{(project as Project).title}</h1>
      <p className="mt-1 text-sm text-muted">
        Visibility, sharing and credits are managed by the portfolio owner.
      </p>
      <div className="mt-8">
        <CollaboratorProjectForm
          project={project as Project}
          canEdit={credit.can_edit}
          canUpload={credit.can_upload}
          userId={user.id}
        />
      </div>
    </div>
  );
}
