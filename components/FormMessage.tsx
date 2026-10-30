import type { ActionState } from "@/lib/types";

export default function FormMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error)
    return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  if (state.success)
    return <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{state.success}</p>;
  return null;
}
