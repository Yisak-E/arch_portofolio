import Image from "next/image";
import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import type { Project } from "@/lib/types";
import ConfirmButton from "../ConfirmButton";
import { deleteProject, togglePublished } from "./actions";

export default async function DashboardProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const { supabase } = await requireOwner();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });
  const projects = (data ?? []) as Project[];

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">Projects</h1>
        <Link href="/dashboard/projects/new" className="btn">
          + New project
        </Link>
      </div>

      {saved && (
        <p className="mt-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">“{saved}” was saved.</p>
      )}

      {projects.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-line p-10 text-center">
          <p className="font-serif text-xl">No projects yet</p>
          <p className="mt-2 text-sm text-muted">Add your first project with photos, drawings and a description.</p>
          <Link href="/dashboard/projects/new" className="btn mt-6">
            Add a project
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-panel">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-line">
                {p.cover_url && <Image src={p.cover_url} alt="" fill sizes="96px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.title}</p>
                <p className="text-xs text-muted">
                  {[p.category, p.year].filter(Boolean).join(" · ") || "—"}
                  {p.featured && " · Featured"}
                </p>
              </div>

              <form action={togglePublished}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="published" value={(!p.published).toString()} />
                <button
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    p.published ? "bg-green-100 text-green-800" : "bg-line text-muted"
                  }`}
                  title={p.published ? "Click to hide from the public site" : "Click to publish"}
                >
                  {p.published ? "Published" : "Draft"}
                </button>
              </form>

              <div className="flex items-center gap-3 text-sm">
                {p.published && (
                  <Link href={`/projects/${p.slug}`} target="_blank" className="text-muted hover:text-ink">
                    View
                  </Link>
                )}
                <Link href={`/dashboard/projects/${p.id}`} className="text-ink underline">
                  Edit
                </Link>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton message={`Delete “${p.title}” and all its images? This can't be undone.`}>
                    Delete
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
