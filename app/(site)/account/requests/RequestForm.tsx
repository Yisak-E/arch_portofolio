"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import FormMessage from "@/components/FormMessage";
import { PROJECT_TYPES } from "@/lib/constants";
import { submitRequest } from "./actions";

export default function RequestForm() {
  const [state, action, pending] = useActionState(submitRequest, undefined);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) ref.current?.reset();
  }, [state]);

  return (
    <form
      ref={ref}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-5 rounded-lg border border-line bg-panel p-6"
    >
      <div>
        <label className="label" htmlFor="title">Project title *</label>
        <input id="title" name="title" required maxLength={200} className="input" placeholder="e.g. Family house in Addis Ababa" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="project_type">Type</label>
          <select id="project_type" name="project_type" className="input" defaultValue="">
            <option value="">Choose…</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="location">Location</label>
          <input id="location" name="location" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="budget">Budget range</label>
          <input id="budget" name="budget" className="input" placeholder="e.g. 50,000–80,000 USD" />
        </div>
        <div>
          <label className="label" htmlFor="timeline">Timeline</label>
          <input id="timeline" name="timeline" className="input" placeholder="e.g. Start in March, 6 months" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="description">Describe what you need *</label>
        <textarea id="description" name="description" required rows={6} maxLength={5000} className="input" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="btn">
        {pending ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
