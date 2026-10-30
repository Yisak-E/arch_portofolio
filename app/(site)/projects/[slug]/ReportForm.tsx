"use client";

import { useActionState, useState } from "react";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";
import { REPORT_REASON_LABELS } from "@/lib/constants";
import { reportProject } from "./actions";

export default function ReportForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(reportProject, undefined);

  if (state?.success) return <FormMessage state={state} />;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-muted underline hover:text-ink">
        Report this project
      </button>
    );
  }

  return (
    <form action={action} className="ml-auto max-w-md space-y-3 rounded-lg border border-line bg-panel p-5 text-left">
      <p className="font-medium">Report this project</p>
      <input type="hidden" name="project_id" value={projectId} />
      <select name="reason" required className="input" defaultValue="">
        <option value="" disabled>
          Choose a reason…
        </option>
        {Object.entries(REPORT_REASON_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <textarea name="details" rows={3} maxLength={2000} placeholder="Details (optional)" className="input" />
      <FormMessage state={state} />
      <div className="flex gap-3">
        <SubmitButton pendingText="Sending…">Send report</SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted">
          Cancel
        </button>
      </div>
    </form>
  );
}
