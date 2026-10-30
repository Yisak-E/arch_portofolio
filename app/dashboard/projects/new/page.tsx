import { requireOwner } from "@/lib/auth";
import ProjectForm from "../ProjectForm";

export default async function NewProjectPage() {
  await requireOwner();
  return (
    <div className="max-w-4xl">
      <h1 className="mb-8 font-serif text-3xl">New project</h1>
      <ProjectForm />
    </div>
  );
}
