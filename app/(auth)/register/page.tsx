import Link from "next/link";
import { safeNext } from "@/lib/auth";
import GoogleButton from "../GoogleButton";
import RegisterForm from "./RegisterForm";

export const metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next);

  return (
    <div>
      <h1 className="font-serif text-3xl">Create an account</h1>
      <p className="mt-2 text-sm text-muted">You only need an account to send a message.</p>

      <div className="mt-8">
        <GoogleButton next={next} />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-line" /> or <div className="h-px flex-1 bg-line" />
      </div>

      <RegisterForm next={next} />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-ink underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
