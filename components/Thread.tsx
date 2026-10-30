import type { ConversationMessage } from "@/lib/types";

/** Message bubbles for a conversation; "mine" is decided by sender id. */
export default function Thread({
  messages,
  myId,
  clientId,
  ownerName,
  clientName,
}: {
  messages: ConversationMessage[];
  myId: string;
  clientId: string;
  ownerName: string;
  clientName: string;
}) {
  return (
    <ol className="space-y-4">
      {messages.map((m) => {
        const mine = m.sender_id === myId;
        const fromClient = m.sender_id === clientId;
        return (
          <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                mine ? "bg-ink text-paper" : "border border-line bg-panel"
              }`}
            >
              <p className={`mb-1 text-xs ${mine ? "text-paper/60" : "text-muted"}`}>
                {fromClient ? clientName : ownerName} ·{" "}
                {new Date(m.created_at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="whitespace-pre-line">{m.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
