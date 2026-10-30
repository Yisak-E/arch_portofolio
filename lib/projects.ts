import type { Project } from "./types";

/** Columns + relations needed for cards, search and filters. */
export const PROJECT_LIST_SELECT =
  "*, original_architect:architects!projects_original_architect_id_fkey(id, name, title, website), project_collaborators(architect_id, credit_role, sort_order, architects(id, name, title))";

/** Full detail for a project page. */
export const PROJECT_DETAIL_SELECT =
  "*, original_architect:architects!projects_original_architect_id_fkey(id, name, title, website), project_media(*), project_collaborators(*, architects(id, name, title, website, profile_id))";

export type ProjectFilters = {
  q?: string;
  category?: string;
  year?: string;
  status?: string;
  architect?: string;
};

/** Names of every architect connected to a project (original author + credits). */
export function architectNames(p: Project) {
  const names = new Set<string>();
  if (p.original_architect?.name) names.add(p.original_architect.name);
  for (const c of p.project_collaborators ?? []) if (c.architects?.name) names.add(c.architects.name);
  return [...names];
}

/** FR-002 search + FR-003 filters. Portfolios are small, so this runs in memory on the server. */
export function filterProjects(projects: Project[], f: ProjectFilters) {
  const terms = (f.q ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return projects.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.year && String(p.year ?? "") !== f.year) return false;
    if (f.status && p.status !== f.status) return false;
    if (f.architect && !architectNames(p).includes(f.architect)) return false;

    if (terms.length) {
      const haystack = [
        p.title,
        p.summary,
        p.description,
        p.design_concept,
        p.materials,
        p.software,
        p.category,
        p.location,
        ...(p.tags ?? []),
        ...architectNames(p),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });
}

/** Distinct, sorted filter options from the visible projects. */
export function filterOptions(projects: Project[]) {
  const uniq = <T,>(xs: (T | null | undefined)[]) => [...new Set(xs.filter((x): x is T => x != null && x !== ""))];
  return {
    categories: uniq(projects.map((p) => p.category)).sort(),
    years: uniq(projects.map((p) => p.year)).sort((a, b) => b - a),
    statuses: uniq(projects.map((p) => p.status)),
    architects: uniq(projects.flatMap(architectNames)).sort(),
  };
}
