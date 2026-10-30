import { requireUser } from "@/lib/auth";
import { statusBadgeClass } from "@/lib/constants";
import type { Invite } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import InviteResponse from "./InviteResponse";

export default async function InvitationsPage() {
  const { supabase, user } = await requireUser("/account/invitations");
  const { data } = await supabase
    .from("collaborator_invites")
    .select("*, architects(name)")
    .ilike("email", user.email ?? "")
    .order("created_at", { ascending: false });
  const invites = (data ?? []) as Invite[];

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl">Collaboration invitations</h1>
      <p className="mt-1 text-sm text-muted">
        Invitations sent to <strong>{user.email}</strong>. Accepting links your account to the architect profile so you
        can work on the projects you&apos;re credited on.
      </p>

      {invites.length === 0 ? (
        <p className="mt-10 text-muted">No invitations.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {invites.map((inv) => (
            <li key={inv.id} className="rounded-lg border border-line bg-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">Join as {inv.architects?.name ?? "a collaborating architect"}</p>
                  <p className="text-xs text-muted">Received {formatDate(inv.created_at)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusBadgeClass(inv.status)}`}>
                  {inv.status}
                </span>
              </div>
              {inv.message && <p className="mt-3 whitespace-pre-line text-sm">{inv.message}</p>}
              {inv.status === "pending" && (
                <div className="mt-4">
                  <InviteResponse inviteId={inv.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
