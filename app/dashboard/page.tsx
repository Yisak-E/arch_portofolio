import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import type { Message } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { supabase } = await requireOwner();

  const [published, drafts, unread, recent] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("published", false),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Published projects", value: published.count ?? 0, href: "/dashboard/projects" },
    { label: "Drafts", value: drafts.count ?? 0, href: "/dashboard/projects" },
    { label: "Unread messages", value: unread.count ?? 0, href: "/dashboard/messages" },
  ];

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">Overview</h1>
        <Link href="/dashboard/projects/new" className="btn">
          + New project
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-lg border border-line bg-panel p-5 transition hover:border-ink">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-2 font-serif text-4xl">{s.value}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl">Latest messages</h2>
          <Link href="/dashboard/messages" className="text-sm text-muted hover:text-ink">
            Open inbox →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-panel">
          {((recent.data ?? []) as Message[]).map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <div className="min-w-0">
                <p className={`truncate ${m.is_read ? "" : "font-semibold"}`}>{m.subject}</p>
                <p className="truncate text-muted">{m.sender_name}</p>
              </div>
              <span className="shrink-0 text-xs text-muted">{formatDate(m.created_at)}</span>
            </li>
          ))}
          {!recent.data?.length && <li className="px-5 py-6 text-sm text-muted">No messages yet.</li>}
        </ul>
      </section>
    </div>
  );
}
