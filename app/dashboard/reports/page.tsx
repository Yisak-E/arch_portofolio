import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import { requireStaff } from "@/lib/auth";
import { REPORT_REASON_LABELS, VISIBILITY_LABELS, statusBadgeClass } from "@/lib/constants";
import type { Report } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { resolveReport } from "./actions";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show = "open" } = await searchParams;
  const { supabase } = await requireStaff();

  let query = supabase
    .from("reports")
    .select("*, projects(title, slug, visibility), profiles!reports_reporter_id_fkey(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (show === "open") query = query.eq("status", "open");
  const { data } = await query;
  const reports = (data ?? []) as Report[];

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl">Reported content</h1>
      <div className="mt-6 flex gap-2 text-sm">
        {[
          ["open", "Open"],
          ["all", "All"],
        ].map(([k, l]) => (
          <Link
            key={k}
            href={`/dashboard/reports?show=${k}`}
            className={`rounded-full border px-4 py-1.5 ${show === k ? "border-ink bg-ink text-paper" : "border-line"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <p className="mt-10 text-muted">No reports.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {reports.map((r) => (
            <li key={r.id} className="rounded-lg border border-line bg-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {r.projects ? (
                      <Link href={`/projects/${r.projects.slug}`} target="_blank" className="underline">
                        {r.projects.title}
                      </Link>
                    ) : (
                      "Deleted project"
                    )}
                    {r.projects && (
                      <span className="ml-2 text-xs text-muted">({VISIBILITY_LABELS[r.projects.visibility]})</span>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    {REPORT_REASON_LABELS[r.reason]} · by {r.profiles?.full_name || r.profiles?.email || "unknown"} ·{" "}
                    {formatDate(r.created_at)}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs capitalize ${statusBadgeClass(r.status)}`}>{r.status}</span>
              </div>
              {r.details && <p className="mt-3 whitespace-pre-line text-sm">{r.details}</p>}
              {r.resolution_note && <p className="mt-3 text-xs text-muted">Resolution: {r.resolution_note}</p>}

              {r.status === "open" && (
                <form action={resolveReport} className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_auto]">
                  <input type="hidden" name="id" value={r.id} />
                  <input name="note" placeholder="Resolution note (optional)" className="input" />
                  <div className="flex flex-wrap gap-2">
                    <select name="decision" defaultValue="dismiss" className="input !w-auto">
                      <option value="dismiss">Dismiss</option>
                      <option value="hide">Hide project (set Private)</option>
                      <option value="delete">Delete project</option>
                    </select>
                    <SubmitButton pendingText="Saving…">Apply</SubmitButton>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
