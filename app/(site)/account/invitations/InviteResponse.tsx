"use client";

import { useActionState } from "react";
import FormMessage from "@/components/FormMessage";
import { respondToInvite } from "./actions";

export default function InviteResponse({ inviteId }: { inviteId: string }) {
  const [state, action, pending] = useActionState(respondToInvite, undefined);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={inviteId} />
      <div className="flex gap-3">
        <button name="accept" value="true" disabled={pending} className="btn !py-1.5">
          Accept
        </button>
        <button name="accept" value="false" disabled={pending} className="btn-outline !py-1.5">
          Decline
        </button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
