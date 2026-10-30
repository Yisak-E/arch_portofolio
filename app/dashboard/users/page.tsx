import { requireStaff } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import type { Profile, Role } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import UserControls from "./UserControls";

/** FR-035 / FR-037 */
export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const { q, role } = await searchParams;
  const { supabase, user, isOwner } = await requireStaff();

  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
  if (role && role in ROLE_LABELS) query = query.eq("role", role);
  if (q) {
    const term = q.replace(/[%,()]/g, " ").trim();
    if (term) query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  }
  const { data } = await query;
  const users = (data ?? []) as Profile[];

  return (
    <div className="max-w-5xl">
      <h1 className="font-serif text-3xl">Users</h1>
      <p className="mt-1 text-sm text-muted">
        Everyone who registered. Only the portfolio owner can grant or remove the Administrator and Owner roles.
      </p>

      <form className="mt-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={q ?? ""} placeholder="Search name or email" className="input max-w-xs" />
        <select name="role" defaultValue={role ?? ""} className="input max-w-[220px]">
          <option value="">All roles</option>
          {Object.entries(ROLE_LABELS).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <button className="btn !py-2">Filter</button>
      </form>

      <ul className="mt-6 divide-y divide-line rounded-lg border border-line bg-panel">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {u.full_name || "—"}
                {u.is_suspended && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">Suspended</span>}
              </p>
              <p className="truncate text-xs text-muted">
                {u.email} · {ROLE_LABELS[u.role]} · joined {formatDate(u.created_at)}
              </p>
            </div>
            <UserControls
              id={u.id}
              role={u.role as Role}
              suspended={u.is_suspended}
              isSelf={u.id === user.id}
              callerIsOwner={isOwner}
            />
          </li>
        ))}
        {users.length === 0 && <li className="px-5 py-6 text-sm text-muted">No users found.</li>}
      </ul>
    </div>
  );
}
