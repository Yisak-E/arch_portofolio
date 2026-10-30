import Link from "next/link";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const nav = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default async function SiteHeader() {
  const { user, isOwner } = await getSession();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("site_profile").select("full_name").single();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link href="/" className="font-serif text-xl tracking-tight">
          {profile?.full_name ?? "Portfolio"}
        </Link>

        <nav className="flex flex-wrap items-center gap-5 text-sm">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-muted transition hover:text-ink">
              {n.label}
            </Link>
          ))}
          {isOwner && (
            <Link href="/dashboard" className="font-medium text-accent">
              Dashboard
            </Link>
          )}
          {user ? (
            <form action="/auth/signout" method="post">
              <button className="text-muted transition hover:text-ink">Sign out</button>
            </form>
          ) : (
            <Link href="/login" className="btn-outline !px-4 !py-1.5">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
