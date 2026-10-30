import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { STATUS_LABELS } from "@/lib/constants";
import { PROJECT_LIST_SELECT, filterOptions, filterProjects, type ProjectFilters } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectStatus } from "@/lib/types";

export const metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<ProjectFilters> }) {
  const filters = await searchParams;
  const supabase = await createClient();

  // Public portfolio only — private/draft work is reachable from the dashboard and account pages.
  const { data } = await supabase
    .from("projects")
    .select(PROJECT_LIST_SELECT)
    .eq("visibility", "public")
    .order("sort_order")
    .order("year", { ascending: false, nullsFirst: false });

  const all = (data ?? []) as Project[];
  const options = filterOptions(all);
  const projects = filterProjects(all, filters);
  const active = Object.values(filters).some(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Portfolio</p>
      <h1 className="mt-3 font-serif text-4xl">Projects</h1>

      {/* FR-002 search + FR-003 filters (GET form → shareable URL) */}
      <form className="mt-8 grid gap-3 rounded-lg border border-line bg-panel p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Search title, place, architect, material…"
          aria-label="Search projects"
          className="input lg:col-span-2"
        />
        <Select name="category" label="Type" value={filters.category} options={options.categories.map((c) => [c, c])} />
        <Select name="year" label="Year" value={filters.year} options={options.years.map((y) => [String(y), String(y)])} />
        <Select
          name="status"
          label="Status"
          value={filters.status}
          options={options.statuses.map((s) => [s, STATUS_LABELS[s as ProjectStatus] ?? s])}
        />
        <Select name="architect" label="Architect" value={filters.architect} options={options.architects.map((a) => [a, a])} />
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
          <button className="btn !py-2">Search</button>
          {active && (
            <Link href="/projects" className="btn-outline !py-2">
              Clear
            </Link>
          )}
          <p className="ml-auto self-center text-sm text-muted">
            {projects.length} of {all.length} project{all.length === 1 ? "" : "s"}
          </p>
        </div>
      </form>

      {projects.length === 0 ? (
        <p className="mt-12 text-muted">{active ? "No projects match your search." : "No projects to show yet."}</p>
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

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: [string, string][];
}) {
  return (
    <select name={name} defaultValue={value ?? ""} aria-label={label} className="input">
      <option value="">{`Any ${label.toLowerCase()}`}</option>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}
