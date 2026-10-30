import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import type { Project } from "@/lib/types";
import ProjectForm from "../ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireOwner();

  const { data } = await supabase
    .from("projects")
    .select("*, project_images(*)")
    .eq("id", id)
    .order("sort_order", { referencedTable: "project_images" })
    .maybeSingle();
  if (!data) notFound();

  return (
    <div className="max-w-4xl">
      <h1 className="mb-8 font-serif text-3xl">Edit project</h1>
      <ProjectForm project={data as Project} />
    </div>
  );
}
