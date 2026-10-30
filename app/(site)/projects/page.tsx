import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export const metadata = { title: "Projects" };
export const revalidate = 60;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("sort_order")
    .order("year", { ascending: false, nullsFirst: false });

  const all = (data ?? []) as Project[];
  const categories = [...new Set(all.map((p) => p.category).filter(Boolean))] as string[];
  const projects = category ? all.filter((p) => p.category === category) : all;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Portfolio</p>
      <h1 className="mt-3 font-serif text-4xl">Projects</h1>

      {categories.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-2 text-sm">
          <FilterLink href="/projects" active={!category}>
            All
          </FilterLink>
          {categories.map((c) => (
            <FilterLink key={c} href={`/projects?category=${encodeURIComponent(c)}`} active={category === c}>
              {c}
            </FilterLink>
          ))}
        </div>
      )}

      {projects.length === 0 ? (
        <p className="mt-12 text-muted">No projects to show yet.</p>
      ) : (
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 transition ${
        active ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-ink hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
