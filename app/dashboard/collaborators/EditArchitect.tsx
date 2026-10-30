"use client";

import { useCallback, useState } from "react";
import type { Architect } from "@/lib/types";
import { ArchitectForm } from "./Forms";

export default function EditArchitect({ architect }: { architect: Architect }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="underline">
        Edit
      </button>
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={close}>
      <div className="w-full max-w-xl rounded-lg bg-panel p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-serif text-xl">Edit {architect.name}</p>
          <button type="button" onClick={close} className="text-sm text-muted">
            Close
          </button>
        </div>
        <ArchitectForm architect={architect} onDone={close} />
      </div>
    </div>
  );
}
