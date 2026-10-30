import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export const revalidate = 60;

async function getProject(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*, project_images(*)")
    .eq("slug", slug)
    .eq("published", true)
    .order("sort_order", { referencedTable: "project_images" })
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
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const images = project.project_images ?? [];
  const facts = [
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

      <header className="mt-6 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          {project.category && <p className="eyebrow">{project.category}</p>}
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{project.title}</h1>
          {project.summary && <p className="mt-5 text-lg text-muted">{project.summary}</p>}
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

      {project.description && (
        <div className="mx-auto mt-14 max-w-3xl whitespace-pre-line text-[17px] leading-8">
          {project.description}
        </div>
      )}

      {images.length > 0 && (
        <section className="mt-16 grid gap-6 sm:grid-cols-2">
          {images
            .filter((img) => img.url !== project.cover_url)
            .map((img, i) => (
              <figure key={img.id ?? i} className={i % 3 === 0 ? "sm:col-span-2" : ""}>
                <div className={`relative overflow-hidden bg-line ${i % 3 === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                  <Image
                    src={img.url}
                    alt={img.caption ?? project.title}
                    fill
                    sizes={i % 3 === 0 ? "100vw" : "50vw"}
                    className="object-cover"
                  />
                </div>
                {img.caption && <figcaption className="mt-2 text-sm text-muted">{img.caption}</figcaption>}
              </figure>
            ))}
        </section>
      )}

      <section className="mt-20 flex flex-col items-start gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-2xl">Interested in this project?</p>
        <Link href={`/contact?project=${project.slug}`} className="btn">
          Contact me about it
        </Link>
      </section>
    </article>
  );
}
