import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: p } = await supabase.from("site_profile").select("full_name, headline").single();

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-ink p-12 text-paper lg:flex">
        <Link href="/" className="font-serif text-2xl">
          {p?.full_name ?? "Portfolio"}
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-paper/60">{p?.headline ?? "Architecture"}</p>
          <p className="mt-4 max-w-md font-serif text-4xl leading-tight">
            Space, light and the way people move through them.
          </p>
        </div>
        <p className="text-sm text-paper/50">Browsing projects never needs an account.</p>
      </section>

      <section className="flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        <Link href="/" className="mb-10 font-serif text-xl lg:hidden">
          {p?.full_name ?? "Portfolio"}
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </main>
  );
}
