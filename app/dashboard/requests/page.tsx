import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import { requireStaff } from "@/lib/auth";
import { REQUEST_STATUS_LABELS, statusBadgeClass } from "@/lib/constants";
import type { CollaborationRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import ConfirmButton from "../ConfirmButton";
import { deleteRequest, updateRequest } from "./actions";

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show = "open" } = await searchParams;
  const { supabase } = await requireStaff();

  let query = supabase
    .from("collaboration_requests")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });
  if (show === "open") query = query.in("status", ["submitted", "under_review"]);
  const { data } = await query;
  const requests = (data ?? []) as CollaborationRequest[];

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl">Collaboration requests</h1>
      <div className="mt-6 flex gap-2 text-sm">
        {[
          ["open", "Open"],
          ["all", "All"],
        ].map(([k, l]) => (
          <Link
            key={k}
            href={`/dashboard/requests?show=${k}`}
            className={`rounded-full border px-4 py-1.5 ${show === k ? "border-ink bg-ink text-paper" : "border-line"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <p className="mt-10 text-muted">No requests.</p>
      ) : (
        <ul className="mt-8 space-y-5">
          {requests.map((r) => (
            <li key={r.id} className="rounded-lg border border-line bg-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted">
                    {r.profiles?.full_name || "Unknown"} ·{" "}
                    <a href={`mailto:${r.profiles?.email}`} className="underline">
                      {r.profiles?.email}
                    </a>{" "}
                    · {formatDate(r.created_at)}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(r.status)}`}>
                  {REQUEST_STATUS_LABELS[r.status]}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                {[
                  ["Type", r.project_type],
                  ["Location", r.location],
                  ["Budget", r.budget],
                  ["Timeline", r.timeline],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="eyebrow">{k}</dt>
                    <dd className="mt-0.5">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 whitespace-pre-line text-sm leading-6">{r.description}</p>

              {r.status !== "withdrawn" && (
                <form action={updateRequest} className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-[180px_1fr_auto]">
                  <input type="hidden" name="id" value={r.id} />
                  <select name="status" defaultValue={r.status} className="input">
                    {Object.entries(REQUEST_STATUS_LABELS)
                      .filter(([k]) => k !== "withdrawn")
                      .map(([k, l]) => (
                        <option key={k} value={k}>
                          {l}
                        </option>
                      ))}
                  </select>
                  <input
                    name="owner_note"
                    defaultValue={r.owner_note ?? ""}
                    placeholder="Note for the client (optional)"
                    className="input"
                  />
                  <SubmitButton pendingText="Updating…">Update</SubmitButton>
                </form>
              )}
              <form action={deleteRequest} className="mt-3 text-right text-xs">
                <input type="hidden" name="id" value={r.id} />
                <ConfirmButton message="Delete this request permanently?">Delete</ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
