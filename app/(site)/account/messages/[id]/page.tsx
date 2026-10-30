import Link from "next/link";
import { notFound } from "next/navigation";
import ReplyForm from "@/components/ReplyForm";
import Thread from "@/components/Thread";
import { requireUser } from "@/lib/auth";
import type { Conversation, ConversationMessage } from "@/lib/types";
import { clientReply } from "../actions";

export default async function AccountThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string }>;
}) {
  const [{ id }, { sent }] = await Promise.all([params, searchParams]);
  const { supabase, user, profile } = await requireUser(`/account/messages/${id}`);

  const { data: conv } = await supabase
    .from("conversations")
    .select("*, projects(title, slug)")
    .eq("id", id)
    .eq("client_id", user.id)
    .maybeSingle();
  if (!conv) notFound();
  const c = conv as Conversation;

  const [{ data: msgs }, { data: site }] = await Promise.all([
    supabase.from("conversation_messages").select("*").eq("conversation_id", id).order("created_at"),
    supabase.from("site_profile").select("full_name").single(),
    c.client_unread
      ? supabase.from("conversations").update({ client_unread: false }).eq("id", id)
      : Promise.resolve(null),
  ]);

  return (
    <div className="max-w-3xl">
      <Link href="/account/messages" className="text-sm text-muted hover:text-ink">
        ← All messages
      </Link>
      <h1 className="mt-4 font-serif text-3xl">{c.subject}</h1>
      {c.projects && (
        <p className="mt-1 text-sm text-muted">
          About{" "}
          <Link href={`/projects/${c.projects.slug}`} className="underline">
            {c.projects.title}
          </Link>
        </p>
      )}
      {sent && (
        <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
          Message sent. You&apos;ll get a notification here when she replies.
        </p>
      )}

      <div className="mt-8">
        <Thread
          messages={(msgs ?? []) as ConversationMessage[]}
          myId={user.id}
          clientId={c.client_id}
          ownerName={site?.full_name ?? "Portfolio owner"}
          clientName={profile?.full_name || "You"}
        />
      </div>

      <div className="mt-8 border-t border-line pt-6">
        <ReplyForm conversationId={c.id} action={clientReply} />
      </div>
    </div>
  );
}
