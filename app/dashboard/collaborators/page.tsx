import { requireStaff } from "@/lib/auth";
import { statusBadgeClass } from "@/lib/constants";
import type { Architect, Invite } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import ConfirmButton from "../ConfirmButton";
import { deleteArchitect, revokeInvite, unlinkArchitect } from "./actions";
import EditArchitect from "./EditArchitect";
import { ArchitectForm, InviteForm } from "./Forms";

/** FR-021: manage architects, invitations and account links. */
export default async function CollaboratorsPage() {
  const { supabase } = await requireStaff();

  const [{ data: archData }, { data: inviteData }, { data: creditData }] = await Promise.all([
    supabase.from("architects").select("*").order("name"),
    supabase.from("collaborator_invites").select("*, architects(name)").order("created_at", { ascending: false }).limit(50),
    supabase.from("project_collaborators").select("architect_id"),
  ]);
  const architects = (archData ?? []) as Architect[];
  const invites = (inviteData ?? []) as Invite[];
  const creditCount = new Map<string, number>();
  for (const c of creditData ?? []) creditCount.set(c.architect_id, (creditCount.get(c.architect_id) ?? 0) + 1);

  return (
    <div className="max-w-5xl space-y-12">
      <section>
        <h1 className="font-serif text-3xl">Collaborators</h1>
        <p className="mt-1 text-sm text-muted">
          Architects you credit on projects or share work from. Invite them to give them an account link, then grant
          per-project permissions from each project&apos;s Credits section.
        </p>
        <div className="mt-6 rounded-lg border border-line bg-panel p-6">
          <h2 className="label !text-sm">Add an architect</h2>
          <div className="mt-3">
            <ArchitectForm />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Architects ({architects.length})</h2>
        {architects.length === 0 ? (
          <p className="mt-4 text-muted">None yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-panel">
            {architects.map((a) => (
              <li key={a.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-muted">
                      {[a.title, `${creditCount.get(a.id) ?? 0} project credit(s)`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {a.profile_id ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">Account linked</span>
                  ) : (
                    <span className="rounded-full bg-line px-3 py-1 text-xs text-muted">Credit only</span>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <EditArchitect architect={a} />
                    {a.profile_id && (
                      <form action={unlinkArchitect}>
                        <input type="hidden" name="id" value={a.id} />
                        <ConfirmButton message={`Unlink ${a.name}'s account? They will lose access to collaborative projects.`}>
                          Unlink
                        </ConfirmButton>
                      </form>
                    )}
                    <form action={deleteArchitect}>
                      <input type="hidden" name="id" value={a.id} />
                      <ConfirmButton message={`Delete ${a.name}? Their credits will be removed from all projects.`}>
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-2xl">Invite to collaborate</h2>
        <div className="mt-4 rounded-lg border border-line bg-panel p-6">
          <InviteForm architects={architects} />
        </div>

        {invites.length > 0 && (
          <ul className="mt-6 divide-y divide-line rounded-lg border border-line bg-panel text-sm">
            {invites.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    {inv.architects?.name ?? "Architect"} · <span className="text-muted">{inv.email}</span>
                  </p>
                  <p className="text-xs text-muted">
                    Sent {formatDate(inv.created_at)}
                    {inv.responded_at && ` · answered ${formatDate(inv.responded_at)}`}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs capitalize ${statusBadgeClass(inv.status)}`}>{inv.status}</span>
                {inv.status === "pending" && (
                  <form action={revokeInvite}>
                    <input type="hidden" name="id" value={inv.id} />
                    <button className="text-xs text-muted hover:text-red-700">Revoke</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
