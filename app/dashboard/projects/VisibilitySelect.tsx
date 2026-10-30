"use client";

import { useRef } from "react";
import { VISIBILITY_LABELS, statusBadgeClass } from "@/lib/constants";
import type { Visibility } from "@/lib/types";

/** Changes visibility as soon as a new value is picked. */
export default function VisibilitySelect({
  id,
  value,
  action,
}: {
  id: string;
  value: Visibility;
  action: (form: FormData) => Promise<void>;
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={action}>
      <input type="hidden" name="id" value={id} />
      <select
        name="visibility"
        defaultValue={value}
        onChange={() => ref.current?.requestSubmit()}
        aria-label="Visibility"
        className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${statusBadgeClass(value)}`}
      >
        {Object.entries(VISIBILITY_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </form>
  );
}
