import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
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
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg leading-snug group-hover:text-accent">{project.title}</h3>
        {project.year && <span className="text-xs text-muted">{project.year}</span>}
      </div>
      {project.category && <p className="eyebrow mt-1">{project.category}</p>}
      {project.summary && <p className="mt-2 line-clamp-2 text-sm text-muted">{project.summary}</p>}
    </Link>
  );
}
