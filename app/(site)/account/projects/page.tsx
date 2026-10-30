import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { STATUS_LABELS, VISIBILITY_LABELS, statusBadgeClass } from "@/lib/constants";
import type { Project } from "@/lib/types";

type Assignment = {
  credit_role: string | null;
  can_edit: boolean;
  can_upload: boolean;
  projects: Project | null;
};

/** FR-027: projects a collaborating architect is credited on (any visibility). */
export default async function MyProjectsPage() {
  const { supabase, user } = await requireUser("/account/projects");

  const { data: architect } = await supabase.from("architects").select("id, name").eq("profile_id", user.id).maybeSingle();

  let assignments: Assignment[] = [];
  if (architect) {
    const { data } = await supabase
      .from("project_collaborators")
      .select("credit_role, can_edit, can_upload, projects(*)")
      .eq("architect_id", architect.id);
    assignments = ((data ?? []) as unknown as Assignment[]).filter((a) => a.projects);
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl">My projects</h1>
      {!architect ? (
        <p className="mt-6 text-muted">
          Your account isn&apos;t linked to an architect profile yet. Accept an invitation to start collaborating.
        </p>
      ) : assignments.length === 0 ? (
        <p className="mt-6 text-muted">You aren&apos;t credited on any projects yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-panel">
          {assignments.map(({ projects: p, credit_role, can_edit, can_upload }) => (
            <li key={p!.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-line">
                {p!.cover_url && <Image src={p!.cover_url} alt="" fill sizes="96px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p!.title}</p>
                <p className="text-xs text-muted">
                  {[credit_role, STATUS_LABELS[p!.status]].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {can_edit ? "Can edit details" : "View only"}
                  {can_upload && " · Can upload media"}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(p!.visibility)}`}>
                {VISIBILITY_LABELS[p!.visibility]}
              </span>
              <div className="flex gap-3 text-sm">
                <Link href={`/projects/${p!.slug}`} className="text-muted hover:text-ink">
                  View
                </Link>
                {(can_edit || can_upload) && (
                  <Link href={`/account/projects/${p!.id}`} className="underline">
                    Edit
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
