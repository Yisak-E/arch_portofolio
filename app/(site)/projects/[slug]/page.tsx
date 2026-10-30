import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { STATUS_LABELS, VISIBILITY_LABELS } from "@/lib/constants";
import { PROJECT_DETAIL_SELECT } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import ReportForm from "./ReportForm";

async function getProject(slug: string) {
  const supabase = await createClient();
  // RLS returns public projects to everyone, and private/draft ones to staff and collaborators.
  const { data } = await supabase
    .from("projects")
    .select(PROJECT_DETAIL_SELECT)
    .eq("slug", slug)
    .order("sort_order", { referencedTable: "project_media" })
    .order("sort_order", { referencedTable: "project_collaborators" })
    .maybeSingle();
  return data as Project | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.summary ?? undefined,
    openGraph: project.cover_url ? { images: [project.cover_url] } : undefined,
    robots: project.visibility === "public" ? undefined : { index: false },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, { user, isStaff }] = await Promise.all([getProject(slug), getSession()]);
  if (!project) notFound();

  const media = project.project_media ?? [];
  const visual = media.filter((m) => m.kind !== "document" && !m.mime_type?.includes("pdf") && m.url !== project.cover_url);
  const files = media.filter((m) => m.kind === "document" || m.mime_type?.includes("pdf"));
  const credits = project.project_collaborators ?? [];

  const facts = [
    ["Status", STATUS_LABELS[project.status]],
    ["Category", project.category],
    ["Location", project.location],
    ["Year", project.year?.toString()],
    ["Area", project.area],
    ["Tools", project.software],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <article className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Link href="/projects" className="text-sm text-muted hover:text-ink">
        ← All projects
      </Link>

      {project.visibility !== "public" && (
        <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {VISIBILITY_LABELS[project.visibility]} project — only you, staff and its collaborators can see this page.
        </p>
      )}

      {/* FR-007: shared projects keep the original architect's attribution */}
      {project.is_shared && project.original_architect && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-panel px-5 py-4 text-sm">
          <p>
            <span className="eyebrow mr-2">Shared project</span>
            Original work by <strong>{project.original_architect.name}</strong>
            {project.original_architect.title && <span className="text-muted"> · {project.original_architect.title}</span>}
          </p>
          {(project.source_url || project.original_architect.website) && (
            <a
              href={project.source_url ?? project.original_architect.website ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              View original source ↗
            </a>
          )}
        </div>
      )}

      <header className="mt-6 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          {project.category && <p className="eyebrow">{project.category}</p>}
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{project.title}</h1>
          {project.summary && <p className="mt-5 text-lg text-muted">{project.summary}</p>}
          {project.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <Link
                  key={t}
                  href={`/projects?q=${encodeURIComponent(t)}`}
                  className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-ink hover:text-ink"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
        {facts.length > 0 && (
          <dl className="grid h-fit grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 text-sm lg:mt-8">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      {project.cover_url && (
        <div className="relative mt-12 aspect-[16/9] overflow-hidden bg-line">
          <Image src={project.cover_url} alt={project.title} fill priority sizes="100vw" className="object-cover" />
        </div>
      )}

      <div className="mx-auto mt-14 max-w-3xl space-y-12">
        {project.description && <Section title="About the project" body={project.description} />}
        {project.design_concept && <Section title="Design concept" body={project.design_concept} />}
        {project.materials && <Section title="Materials & technologies" body={project.materials} />}
      </div>

      {visual.length > 0 && (
        <section className="mt-16 grid gap-6 sm:grid-cols-2">
          {visual.map((img, i) => (
            <figure key={img.id ?? i} className={i % 3 === 0 ? "sm:col-span-2" : ""}>
              <div className={`relative overflow-hidden bg-line ${i % 3 === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                <Image
                  src={img.url}
                  alt={img.caption ?? project.title}
                  fill
                  sizes={i % 3 === 0 ? "100vw" : "50vw"}
                  className={img.kind === "drawing" ? "bg-white object-contain" : "object-cover"}
                />
              </div>
              {(img.caption || img.kind === "drawing") && (
                <figcaption className="mt-2 text-sm text-muted">
                  {img.kind === "drawing" && <span className="eyebrow mr-2">Drawing</span>}
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </section>
      )}

      {files.length > 0 && (
        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="font-serif text-2xl">Drawings & documents</h2>
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-panel">
            {files.map((f) => (
              <li key={f.id ?? f.path} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="min-w-0 truncate">{f.caption || f.file_name || "Document"}</span>
                <a href={f.url} target="_blank" rel="noreferrer" className="shrink-0 underline">
                  Open PDF ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FR-006: collaborator credits */}
      {credits.length > 0 && (
        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="font-serif text-2xl">Credits</h2>
          <dl className="mt-4 grid gap-x-8 gap-y-4 border-t border-line pt-5 sm:grid-cols-2">
            {credits.map((c) => (
              <div key={c.id ?? c.architect_id}>
                <dt className="eyebrow">{c.credit_role || "Collaborator"}</dt>
                <dd className="mt-1">
                  {c.architects?.website ? (
                    <a href={c.architects.website} target="_blank" rel="noreferrer" className="underline">
                      {c.architects.name}
                    </a>
                  ) : (
                    c.architects?.name
                  )}
                  {c.architects?.title && <span className="text-muted"> · {c.architects.title}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-20 flex flex-col items-start gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-2xl">Interested in this project?</p>
        <Link href={`/contact?project=${project.slug}`} className="btn">
          Contact me about it
        </Link>
      </section>

      {/* FR-038: signed-in users can report content */}
      {user && !isStaff && (
        <div className="mt-10 text-right">
          <ReportForm projectId={project.id} />
        </div>
      )}
    </article>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section>
      <h2 className="eyebrow">{title}</h2>
      <div className="mt-3 whitespace-pre-line text-[17px] leading-8">{body}</div>
    </section>
  );
}
