import Link from "next/link";
import { requireUser } from "@/lib/auth";
import type { Conversation } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function AccountMessagesPage() {
  const { supabase, user } = await requireUser("/account/messages");
  const { data } = await supabase
    .from("conversations")
    .select("*, projects(title, slug)")
    .eq("client_id", user.id)
    .order("last_message_at", { ascending: false });
  const conversations = (data ?? []) as Conversation[];

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">Messages</h1>
        <Link href="/contact" className="btn">
          New message
        </Link>
      </div>

      {conversations.length === 0 ? (
        <p className="mt-10 text-muted">No conversations yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-panel">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/account/messages/${c.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-paper">
                <div className="min-w-0">
                  <p className={`truncate ${c.client_unread ? "font-semibold" : ""}`}>
                    {c.client_unread && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />}
                    {c.subject}
                  </p>
                  {c.projects && <p className="truncate text-xs text-muted">About: {c.projects.title}</p>}
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
