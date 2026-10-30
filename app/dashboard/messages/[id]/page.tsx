import Link from "next/link";
import { notFound } from "next/navigation";
import ReplyForm from "@/components/ReplyForm";
import Thread from "@/components/Thread";
import { requireStaff } from "@/lib/auth";
import type { Conversation, ConversationMessage } from "@/lib/types";
import ConfirmButton from "../../ConfirmButton";
import { deleteConversation, ownerReply, setArchived, setRead } from "../actions";

export default async function DashboardThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireStaff();

  const { data } = await supabase
    .from("conversations")
    .select("*, projects(title, slug), profiles(full_name, email)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const c = data as Conversation;

  const [{ data: msgs }, { data: site }] = await Promise.all([
    supabase.from("conversation_messages").select("*").eq("conversation_id", id).order("created_at"),
    supabase.from("site_profile").select("full_name").single(),
    c.owner_unread ? supabase.from("conversations").update({ owner_unread: false }).eq("id", id) : Promise.resolve(null),
  ]);

  const clientName = c.profiles?.full_name || c.profiles?.email || "Client";

  return (
    <div className="max-w-3xl">
      <Link href="/dashboard/messages" className="text-sm text-muted hover:text-ink">
        ← Inbox
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">{c.subject}</h1>
          <p className="mt-1 text-sm text-muted">
            {clientName} ·{" "}
            <a href={`mailto:${c.profiles?.email}?subject=${encodeURIComponent(`Re: ${c.subject}`)}`} className="underline">
              {c.profiles?.email}
            </a>
            {c.projects && (
              <>
                {" "}· about{" "}
                <Link href={`/projects/${c.projects.slug}`} target="_blank" className="underline">
                  {c.projects.title}
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <form action={setRead}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="unread" value="true" />
            <button className="text-muted hover:text-ink">Mark unread</button>
          </form>
          <form action={setArchived}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="archived" value={String(c.status !== "archived")} />
            <button className="text-muted hover:text-ink">{c.status === "archived" ? "Move to inbox" : "Archive"}</button>
          </form>
          <form action={deleteConversation}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="redirect" value="1" />
            <ConfirmButton message="Delete this whole conversation?">Delete</ConfirmButton>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <Thread
          messages={(msgs ?? []) as ConversationMessage[]}
          myId={user.id}
          clientId={c.client_id}
          ownerName={site?.full_name ?? "You"}
          clientName={clientName}
        />
      </div>

      <div className="mt-8 border-t border-line pt-6">
        <ReplyForm conversationId={c.id} action={ownerReply} />
      </div>
    </div>
  );
}
