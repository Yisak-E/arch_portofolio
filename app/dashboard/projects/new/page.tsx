import { requireStaff } from "@/lib/auth";
import type { Architect } from "@/lib/types";
import ProjectForm from "../ProjectForm";

export default async function NewProjectPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("architects").select("*").order("name");
  return (
    <div className="max-w-4xl">
      <h1 className="mb-8 font-serif text-3xl">New project</h1>
      <ProjectForm architects={(data ?? []) as Architect[]} />
    </div>
  );
}
