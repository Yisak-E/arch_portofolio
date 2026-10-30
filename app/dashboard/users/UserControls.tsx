"use client";

import { useActionState } from "react";
import { ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { setRole, setSuspended } from "./actions";

export default function UserControls({
  id,
  role,
  suspended,
  isSelf,
  callerIsOwner,
}: {
  id: string;
  role: Role;
  suspended: boolean;
  isSelf: boolean;
  callerIsOwner: boolean;
}) {
  const [roleState, roleAction, rolePending] = useActionState(setRole, undefined);
  const [suspState, suspAction, suspPending] = useActionState(setSuspended, undefined);

  if (isSelf) return <span className="text-xs text-muted">This is you</span>;

  const roles = (Object.keys(ROLE_LABELS) as Role[]).filter(
    (r) => callerIsOwner || (r !== "owner" && r !== "admin") || r === role
  );
  const locked = !callerIsOwner && (role === "owner" || role === "admin");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form action={roleAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={id} />
        <select name="role" defaultValue={role} disabled={locked || rolePending} className="input !w-auto !py-1 text-xs" aria-label="Role">
          {roles.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        {!locked && (
          <button disabled={rolePending} className="text-xs underline">
            Apply
          </button>
        )}
      </form>
      {role !== "owner" && !locked && (
        <form action={suspAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="suspend" value={String(!suspended)} />
          <button disabled={suspPending} className={`text-xs ${suspended ? "text-green-800" : "text-red-700"} underline`}>
            {suspended ? "Reactivate" : "Suspend"}
          </button>
        </form>
      )}
      {(roleState?.error || suspState?.error) && (
        <span className="text-xs text-red-700">{roleState?.error || suspState?.error}</span>
      )}
      {(roleState?.success || suspState?.success) && (
        <span className="text-xs text-green-800">{roleState?.success || suspState?.success}</span>
      )}
    </div>
  );
}
