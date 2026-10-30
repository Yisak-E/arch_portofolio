import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;
  const supabase = await createClient();

  const [{ data: profile }, { data: featured }, { data: recent }] = await Promise.all([
    supabase.from("site_profile").select("full_name, headline, bio").single(),
    supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .eq("featured", true)
      .order("sort_order")
      .limit(6),
    supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const projects = (featured?.length ? featured : recent ?? []) as Project[];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {denied && (
        <p className="mt-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The dashboard is only available to the portfolio owner.
        </p>
      )}

      <section className="py-20 sm:py-28">
        <p className="eyebrow">{profile?.headline ?? "Architecture student"}</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">
          {profile?.full_name ?? "Portfolio"}
        </h1>
        {profile?.bio && (
          <p className="mt-6 max-w-2xl text-lg text-muted line-clamp-3">{profile.bio}</p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/projects" className="btn">
            View projects
          </Link>
          <Link href="/contact" className="btn-outline">
            Get in touch
          </Link>
        </div>
      </section>

      <section className="border-t border-line py-14">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl">Selected work</h2>
          <Link href="/projects" className="text-sm text-muted hover:text-ink">
            All projects →
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="text-muted">Projects are coming soon.</p>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
