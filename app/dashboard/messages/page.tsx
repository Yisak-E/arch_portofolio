import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import type { Conversation } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const TABS = [
  { key: "inbox", label: "Inbox" },
  { key: "unread", label: "Unread" },
  { key: "archived", label: "Archived" },
];

/** FR-022 */
export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "inbox" } = await searchParams;
  const { supabase } = await requireStaff();

  let query = supabase
    .from("conversations")
    .select("*, projects(title, slug), profiles(full_name, email)")
    .order("last_message_at", { ascending: false });
  if (tab === "archived") query = query.eq("status", "archived");
  else query = query.eq("status", "open");
  if (tab === "unread") query = query.eq("owner_unread", true);
  const { data } = await query;
  const conversations = (data ?? []) as Conversation[];

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl">Messages</h1>
      <div className="mt-6 flex gap-2 text-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/messages?tab=${t.key}`}
            className={`rounded-full border px-4 py-1.5 ${tab === t.key ? "border-ink bg-ink text-paper" : "border-line"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {conversations.length === 0 ? (
        <p className="mt-10 text-muted">Nothing here.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-panel">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/dashboard/messages/${c.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-paper">
                <div className="min-w-0">
                  <p className={`truncate ${c.owner_unread ? "font-semibold" : ""}`}>
                    {c.owner_unread && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />}
                    {c.subject}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {c.profiles?.full_name || "Unknown"} · {c.profiles?.email}
                    {c.projects && ` · about ${c.projects.title}`}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted">{formatDate(c.last_message_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
