import Link from "next/link";
import { safeNext } from "@/lib/auth";
import GoogleButton from "../GoogleButton";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = safeNext(sp.next);

  return (
    <div>
      <h1 className="font-serif text-3xl">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Sign in to send a message or manage the portfolio.</p>

      {sp.error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Sign-in didn&apos;t complete. Please try again.
        </p>
      )}

      <div className="mt-8">
        <GoogleButton next={next} />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-line" /> or <div className="h-px flex-1 bg-line" />
      </div>

      <LoginForm next={next} />

      <p className="mt-6 text-center text-sm text-muted">
        No account yet?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-ink underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
