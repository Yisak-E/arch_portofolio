import Image from "next/image";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { STATUS_LABELS, VISIBILITY_LABELS } from "@/lib/constants";
import type { Project, Visibility } from "@/lib/types";
import ConfirmButton from "../ConfirmButton";
import { deleteProject, setVisibility } from "./actions";
import VisibilitySelect from "./VisibilitySelect";

export default async function DashboardProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; visibility?: string }>;
}) {
  const { saved, visibility } = await searchParams;
  const { supabase } = await requireStaff();

  let query = supabase
    .from("projects")
    .select("*, original_architect:architects!projects_original_architect_id_fkey(id, name)")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (visibility && visibility in VISIBILITY_LABELS) query = query.eq("visibility", visibility);
  const { data } = await query;
  const projects = (data ?? []) as Project[];

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">Projects</h1>
        <Link href="/dashboard/projects/new" className="btn">
          + New project
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        {[undefined, ...Object.keys(VISIBILITY_LABELS)].map((v) => (
          <Link
            key={v ?? "all"}
            href={v ? `/dashboard/projects?visibility=${v}` : "/dashboard/projects"}
            className={`rounded-full border px-4 py-1.5 ${visibility === v ? "border-ink bg-ink text-paper" : "border-line"}`}
          >
            {v ? VISIBILITY_LABELS[v as Visibility] : "All"}
          </Link>
        ))}
      </div>

      {saved && <p className="mt-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">“{saved}” was saved.</p>}

      {projects.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-line p-10 text-center">
          <p className="font-serif text-xl">No projects here yet</p>
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
                  {[p.category, p.year, STATUS_LABELS[p.status]].filter(Boolean).join(" · ")}
                  {p.featured && " · Featured"}
                </p>
                {p.is_shared && (
                  <p className="text-xs text-muted">Shared · original by {p.original_architect?.name ?? "unknown"}</p>
                )}
              </div>

              <VisibilitySelect id={p.id} value={p.visibility} action={setVisibility} />

              <div className="flex items-center gap-3 text-sm">
                <Link href={`/projects/${p.slug}`} target="_blank" className="text-muted hover:text-ink">
                  View
                </Link>
                <Link href={`/dashboard/projects/${p.id}`} className="text-ink underline">
                  Edit
                </Link>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton message={`Delete “${p.title}” and all its files? This can't be undone.`}>Delete</ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
