import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import type { Architect, Project } from "@/lib/types";
import ProjectForm from "../ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();

  const [{ data }, { data: architects }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, project_media(*), project_collaborators(*)")
      .eq("id", id)
      .order("sort_order", { referencedTable: "project_media" })
      .order("sort_order", { referencedTable: "project_collaborators" })
      .maybeSingle(),
    supabase.from("architects").select("*").order("name"),
  ]);
  if (!data) notFound();
  const project = data as Project;

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-3xl">Edit project</h1>
        <Link href={`/projects/${project.slug}`} target="_blank" className="text-sm text-muted hover:text-ink">
          Preview ↗
        </Link>
      </div>
      <ProjectForm project={project} architects={(architects ?? []) as Architect[]} />
    </div>
  );
}
