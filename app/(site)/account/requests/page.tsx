import { requireUser } from "@/lib/auth";
import { REQUEST_STATUS_LABELS, statusBadgeClass } from "@/lib/constants";
import type { CollaborationRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { withdrawRequest } from "./actions";
import RequestForm from "./RequestForm";

const STEPS = ["submitted", "under_review", "accepted", "completed"] as const;

export default async function RequestsPage() {
  const { supabase, user, profile } = await requireUser("/account/requests");
  const { data } = await supabase
    .from("collaboration_requests")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });
  const requests = (data ?? []) as CollaborationRequest[];

  return (
    <div className="max-w-3xl space-y-12">
      <section>
        <h1 className="font-serif text-3xl">Collaboration requests</h1>
        <p className="mt-1 text-sm text-muted">Propose a project and follow its status here.</p>

        {requests.length === 0 ? (
          <p className="mt-8 text-muted">You haven&apos;t sent any requests yet.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {requests.map((r) => {
              const step = STEPS.indexOf(r.status as (typeof STEPS)[number]);
              return (
                <li key={r.id} className="rounded-lg border border-line bg-panel p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-muted">
                        {[r.project_type, r.location, `Sent ${formatDate(r.created_at)}`].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(r.status)}`}>
                      {REQUEST_STATUS_LABELS[r.status]}
                    </span>
                  </div>

                  {step >= 0 && (
                    <ol className="mt-4 grid grid-cols-4 gap-1 text-[11px] text-muted">
                      {STEPS.map((s, i) => (
                        <li key={s}>
                          <div className={`h-1 rounded-full ${i <= step ? "bg-ink" : "bg-line"}`} />
                          <p className="mt-1">{REQUEST_STATUS_LABELS[s]}</p>
                        </li>
                      ))}
                    </ol>
                  )}

                  {r.owner_note && (
                    <p className="mt-4 rounded-md bg-paper px-3 py-2 text-sm">
                      <span className="eyebrow mr-2">Note</span>
                      {r.owner_note}
                    </p>
                  )}

                  {(r.status === "submitted" || r.status === "under_review") && !profile?.is_suspended && (
                    <form action={withdrawRequest} className="mt-4">
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-xs text-muted underline hover:text-red-700">Withdraw request</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {!profile?.is_suspended && (
        <section>
          <h2 className="font-serif text-2xl">New request</h2>
          <div className="mt-4">
            <RequestForm />
          </div>
        </section>
      )}
    </div>
  );
}
