"use client";

import { useActionState } from "react";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";
import { signUp } from "../actions";

export default function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState(signUp, undefined);

  if (state?.success) return <FormMessage state={state} />;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="full_name">Full name</label>
        <input id="full_name" name="full_name" autoComplete="name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required className="input" />
        <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Creating account…" className="btn w-full">
        Create account
      </SubmitButton>
    </form>
  );
}
