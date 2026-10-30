import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import { requireStaff } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import DashboardNav from "./DashboardNav";

export const metadata = { title: "Dashboard" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile } = await requireStaff();

  const [unread, requests, reports] = await Promise.all([
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("owner_unread", true),
    supabase.from("collaboration_requests").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-6 bg-ink p-6 text-paper md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href="/" className="font-serif text-xl">
              Portfolio
            </Link>
            <p className="mt-1 truncate text-xs text-paper/50">{user.email}</p>
            <p className="text-xs text-paper/50">{profile ? ROLE_LABELS[profile.role] : ""}</p>
          </div>
          <NotificationBell userId={user.id} dark />
        </div>
        <DashboardNav
          counts={{
            messages: unread.count ?? 0,
            requests: requests.count ?? 0,
            reports: reports.count ?? 0,
          }}
        />
        <div className="mt-auto flex flex-col gap-2 text-sm text-paper/70">
          <Link href="/" className="hover:text-paper">
            View public site ↗
          </Link>
          <Link href="/account" className="hover:text-paper">
            My account
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
