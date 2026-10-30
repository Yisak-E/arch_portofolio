import Image from "next/image";
import Link from "next/link";
import { STATUS_LABELS, VISIBILITY_LABELS } from "@/lib/constants";
import type { Project } from "@/lib/types";

export default function ProjectCard({ project, href }: { project: Project; href?: string }) {
  return (
    <Link href={href ?? `/projects/${project.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        {project.cover_url ? (
          <Image
            src={project.cover_url}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">No image yet</div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {project.is_shared && (
            <span className="rounded-full bg-ink/85 px-2.5 py-0.5 text-[11px] text-paper">Shared project</span>
          )}
          {project.visibility !== "public" && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] text-amber-900">
              {VISIBILITY_LABELS[project.visibility]}
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg leading-snug group-hover:text-accent">{project.title}</h3>
        {project.year && <span className="text-xs text-muted">{project.year}</span>}
      </div>
      <p className="eyebrow mt-1">
        {[project.category, STATUS_LABELS[project.status]].filter(Boolean).join(" · ")}
      </p>
      {project.is_shared && project.original_architect && (
        <p className="mt-1 text-xs text-muted">Original work by {project.original_architect.name}</p>
      )}
      {project.summary && <p className="mt-2 line-clamp-2 text-sm text-muted">{project.summary}</p>}
    </Link>
  );
}
