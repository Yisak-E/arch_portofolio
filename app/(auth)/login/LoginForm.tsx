"use client";

import { useActionState } from "react";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";
import { signIn } from "../actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Signing in…" className="btn w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
