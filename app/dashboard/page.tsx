import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import type { Conversation } from "@/lib/types";

type TableName = keyof Database["public"]["Tables"];
import { formatDate } from "@/lib/utils";

/** FR-025 */
export default async function DashboardPage() {
  const { supabase } = await requireStaff();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const count = (table: TableName, filter?: (q: any) => any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = filter(q);
    return q.then((r: { count: number | null }) => r.count ?? 0);
  };

  const [total, pub, priv, draft, shared, collaborators, conversations, unread, openRequests, openReports, recent] =
    await Promise.all([
      count("projects"),
      count("projects", (q) => q.eq("visibility", "public")),
      count("projects", (q) => q.eq("visibility", "private")),
      count("projects", (q) => q.eq("visibility", "draft")),
      count("projects", (q) => q.eq("is_shared", true)),
      count("architects"),
      count("conversations"),
      count("conversations", (q) => q.eq("owner_unread", true)),
      count("collaboration_requests", (q) => q.in("status", ["submitted", "under_review"])),
      count("reports", (q) => q.eq("status", "open")),
      supabase
        .from("conversations")
        .select("*, profiles(full_name, email)")
        .order("last_message_at", { ascending: false })
        .limit(5),
    ]);

  const stats = [
    { label: "Total projects", value: total, href: "/dashboard/projects" },
    { label: "Public", value: pub, href: "/dashboard/projects?visibility=public" },
    { label: "Private", value: priv, href: "/dashboard/projects?visibility=private" },
    { label: "Drafts", value: draft, href: "/dashboard/projects?visibility=draft" },
    { label: "Shared projects", value: shared, href: "/dashboard/projects" },
    { label: "Collaborators", value: collaborators, href: "/dashboard/collaborators" },
    { label: "Messages received", value: conversations, sub: unread ? `${unread} unread` : undefined, href: "/dashboard/messages" },
    { label: "Open requests", value: openRequests, href: "/dashboard/requests" },
    { label: "Open reports", value: openReports, href: "/dashboard/reports" },
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
            {s.sub && <p className="mt-1 text-xs text-accent">{s.sub}</p>}
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl">Latest conversations</h2>
          <Link href="/dashboard/messages" className="text-sm text-muted hover:text-ink">
            Open inbox →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-panel">
          {((recent.data ?? []) as Conversation[]).map((c) => (
            <li key={c.id}>
              <Link href={`/dashboard/messages/${c.id}`} className="flex items-center justify-between gap-4 px-5 py-3 text-sm hover:bg-paper">
                <div className="min-w-0">
                  <p className={`truncate ${c.owner_unread ? "font-semibold" : ""}`}>{c.subject}</p>
                  <p className="truncate text-muted">{c.profiles?.full_name || c.profiles?.email}</p>
                </div>
                <span className="shrink-0 text-xs text-muted">{formatDate(c.last_message_at)}</span>
              </Link>
            </li>
          ))}
          {!recent.data?.length && <li className="px-5 py-6 text-sm text-muted">No messages yet.</li>}
        </ul>
      </section>
    </div>
  );
}
