"use client";

import { useActionState, useTransition } from "react";
import FormMessage from "@/components/FormMessage";
import { startConversation } from "./actions";

export default function ContactForm({
  defaultName,
  email,
  project,
}: {
  defaultName: string;
  email: string;
  project: { id: string; title: string } | null;
}) {
  const [state, action, pending] = useActionState(startConversation, undefined);
  const [, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        // Keeps the typed message if the server returns an error.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-5 rounded-lg border border-line bg-panel p-6 sm:p-8"
    >
      {project && <input type="hidden" name="project_id" value={project.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" name="name" required defaultValue={defaultName} className="input" />
        </div>
        <div>
          <label className="label">Replies go to</label>
          <input value={email} disabled className="input bg-paper text-muted" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="subject">Subject</label>
        <input
          id="subject"
          name="subject"
          required
          maxLength={200}
          defaultValue={project ? `About your project: ${project.title}` : ""}
          className="input"
        />
      </div>

      <div>
        <label className="label" htmlFor="body">Message</label>
        <textarea id="body" name="body" required rows={7} maxLength={5000} className="input" />
      </div>

      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="btn">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
