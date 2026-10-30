import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import DashboardNav from "./DashboardNav";

export const metadata = { title: "Dashboard" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireOwner();
  const { count: unread } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-6 bg-ink p-6 text-paper md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <div>
          <Link href="/" className="font-serif text-xl">
            Portfolio
          </Link>
          <p className="mt-1 truncate text-xs text-paper/50">{user.email}</p>
        </div>
        <DashboardNav unread={unread ?? 0} />
        <div className="mt-auto flex flex-col gap-2 text-sm text-paper/70">
          <Link href="/" className="hover:text-paper">
            View public site ↗
          </Link>
          <form action="/auth/signout" method="post">
            <button className="hover:text-paper">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12">{children}</main>
    </div>
  );
}
