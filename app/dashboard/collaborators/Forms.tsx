"use client";

import { useActionState, useEffect, useRef } from "react";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";
import type { Architect } from "@/lib/types";
import { inviteArchitect, saveArchitect } from "./actions";

export function ArchitectForm({ architect, onDone }: { architect?: Architect; onDone?: () => void }) {
  const [state, action] = useActionState(saveArchitect, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.success && !architect) ref.current?.reset();
    if (state?.success) onDone?.();
  }, [state, architect, onDone]);

  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-2">
      {architect && <input type="hidden" name="id" value={architect.id} />}
      <input name="name" required defaultValue={architect?.name} placeholder="Full name *" className="input" />
      <input name="title" defaultValue={architect?.title ?? ""} placeholder="Title, e.g. Architect at Studio X" className="input" />
      <input name="website" defaultValue={architect?.website ?? ""} placeholder="Website" className="input" />
      <input name="bio" defaultValue={architect?.bio ?? ""} placeholder="Short bio" className="input" />
      <div className="flex items-center gap-3 sm:col-span-2">
        <SubmitButton>{architect ? "Save" : "Add architect"}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function InviteForm({ architects }: { architects: Architect[] }) {
  const [state, action] = useActionState(inviteArchitect, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.success) ref.current?.reset();
  }, [state]);

  const unlinked = architects.filter((a) => !a.profile_id);
  if (unlinked.length === 0) {
    return <p className="text-sm text-muted">Add an architect above first — every architect is already linked to an account.</p>;
  }

  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-2">
      <select name="architect_id" required className="input" defaultValue="">
        <option value="" disabled>
          Architect to invite…
        </option>
        {unlinked.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <input name="email" type="email" required placeholder="Their email address" className="input" />
      <textarea name="message" rows={2} placeholder="Personal message (optional)" className="input sm:col-span-2" />
      <div className="space-y-2 sm:col-span-2">
        <SubmitButton pendingText="Sending…">Send invitation</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
