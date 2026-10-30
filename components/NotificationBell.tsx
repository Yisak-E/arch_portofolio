import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/** Header bell with unread count (FR-040). */
export default async function NotificationBell({ userId, dark = false }: { userId: string; dark?: boolean }) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  const unread = count ?? 0;

  return (
    <Link
      href="/account/notifications"
      aria-label={unread ? `${unread} unread notifications` : "Notifications"}
      className={`relative inline-flex items-center ${dark ? "text-paper/70 hover:text-paper" : "text-muted hover:text-ink"}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -right-2 -top-1.5 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] leading-4 text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
