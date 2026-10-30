"use client";

import { useActionState, useEffect, useRef } from "react";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";
import type { ActionState } from "@/lib/types";

/** Reply box shared by the client and owner thread pages (FR-024, FR-034). */
export default function ReplyForm({
  conversationId,
  action,
}: {
  conversationId: string;
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-3">
      <input type="hidden" name="conversation_id" value={conversationId} />
      <textarea name="body" required rows={4} maxLength={5000} placeholder="Write a reply…" className="input" />
      {state?.error && <FormMessage state={state} />}
      <SubmitButton pendingText="Sending…">Send reply</SubmitButton>
    </form>
  );
}
