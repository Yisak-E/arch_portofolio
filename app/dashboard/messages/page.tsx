import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import type { Message } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import ConfirmButton from "../ConfirmButton";
import { deleteMessage, setRead } from "./actions";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const { supabase } = await requireOwner();

  let query = supabase
    .from("messages")
    .select("*, projects(title, slug)")
    .order("created_at", { ascending: false });
  if (filter === "unread") query = query.eq("is_read", false);
  const { data } = await query;
  const messages = (data ?? []) as Message[];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">Messages</h1>
        <div className="flex gap-2 text-sm">
          <Link
            href="/dashboard/messages"
            className={`rounded-full border px-4 py-1.5 ${filter !== "unread" ? "border-ink bg-ink text-paper" : "border-line"}`}
          >
            All
          </Link>
          <Link
            href="/dashboard/messages?filter=unread"
            className={`rounded-full border px-4 py-1.5 ${filter === "unread" ? "border-ink bg-ink text-paper" : "border-line"}`}
          >
            Unread
          </Link>
        </div>
      </div>

      {messages.length === 0 ? (
        <p className="mt-10 text-muted">No messages here.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-lg border bg-panel p-5 ${m.is_read ? "border-line" : "border-ink"}`}
            >
              <details open={!m.is_read}>
                <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`${m.is_read ? "" : "font-semibold"}`}>
                      {!m.is_read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />}
                      {m.subject}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {m.sender_name} · {m.sender_email}
                    </p>
                  </div>
                  <span className="text-xs text-muted">{formatDate(m.created_at)}</span>
                </summary>

                {m.projects && (
                  <p className="mt-3 text-xs text-muted">
                    About project:{" "}
                    <Link href={`/projects/${m.projects.slug}`} target="_blank" className="underline">
                      {m.projects.title}
                    </Link>
                  </p>
                )}
                <p className="mt-4 whitespace-pre-line text-sm leading-7">{m.body}</p>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                  <a
                    href={`mailto:${m.sender_email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                    className="btn !py-1.5"
                  >
                    Reply by email
                  </a>
                  <form action={setRead}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="is_read" value={(!m.is_read).toString()} />
                    <button className="text-muted hover:text-ink">
                      Mark as {m.is_read ? "unread" : "read"}
                    </button>
                  </form>
                  <form action={deleteMessage}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton message="Delete this message?">Delete</ConfirmButton>
                  </form>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
