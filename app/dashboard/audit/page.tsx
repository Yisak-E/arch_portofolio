import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import type { AuditEntry } from "@/lib/types";

const ENTITIES = [
  "projects",
  "project_media",
  "project_collaborators",
  "architects",
  "collaborator_invites",
  "collaboration_requests",
  "reports",
  "conversations",
  "profiles",
  "site_profile",
];

function show(v: unknown) {
  if (v === null || v === undefined || v === "") return "∅";
  if (typeof v === "string") return v.length > 60 ? `${v.slice(0, 60)}…` : v;
  return JSON.stringify(v);
}

/** FR-039: read-only audit trail written by database triggers. */
export default async function AuditPage({ searchParams }: { searchParams: Promise<{ entity?: string }> }) {
  const { entity } = await searchParams;
  const { supabase } = await requireStaff();

  let query = supabase
    .from("audit_log")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (entity && ENTITIES.includes(entity)) query = query.eq("entity", entity);
  const { data } = await query;
  const entries = (data ?? []) as AuditEntry[];

  return (
    <div className="max-w-5xl">
      <h1 className="font-serif text-3xl">Audit log</h1>
      <p className="mt-1 text-sm text-muted">The latest 200 recorded actions. Entries are written automatically and cannot be edited.</p>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <Link href="/dashboard/audit" className={`rounded-full border px-3 py-1 ${!entity ? "border-ink bg-ink text-paper" : "border-line"}`}>
          All
        </Link>
        {ENTITIES.map((e) => (
          <Link
            key={e}
            href={`/dashboard/audit?entity=${e}`}
            className={`rounded-full border px-3 py-1 ${entity === e ? "border-ink bg-ink text-paper" : "border-line"}`}
          >
            {e.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-panel">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Who</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Record</th>
              <th className="px-4 py-3 font-medium">Changes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line align-top">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                  {new Date(e.created_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                </td>
                <td className="px-4 py-3 text-xs">{e.profiles?.full_name || e.profiles?.email || (e.actor_id ? "User" : "System")}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      e.action === "delete" ? "bg-red-100 text-red-800" : e.action === "insert" ? "bg-green-100 text-green-800" : "bg-line"
                    }`}
                  >
                    {e.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="text-muted">{e.entity.replace(/_/g, " ")}</span>
                  {e.label && <p className="font-medium">{e.label}</p>}
                </td>
                <td className="px-4 py-3 text-xs">
                  {e.changes ? (
                    <ul className="space-y-0.5">
                      {Object.entries(e.changes).map(([k, v]) => (
                        <li key={k}>
                          <span className="text-muted">{k}:</span> {show(v.from)} → {show(v.to)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted">
                  Nothing recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
