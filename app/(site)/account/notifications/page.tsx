import Link from "next/link";
import { requireUser } from "@/lib/auth";
import type { Notification } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { deleteNotification, markAllNotificationsRead, markNotificationRead } from "../actions";

export default async function NotificationsPage() {
  const { supabase, user } = await requireUser("/account/notifications");
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  const items = (data ?? []) as Notification[];
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">Notifications</h1>
        {unread > 0 && (
          <form action={markAllNotificationsRead}>
            <button className="btn-outline !py-1.5">Mark all as read</button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-muted">You&apos;re all caught up.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-panel">
          {items.map((n) => (
            <li key={n.id} className="flex flex-wrap items-start gap-3 px-5 py-4">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-accent"}`} />
              <div className="min-w-0 flex-1">
                <p className={n.read_at ? "" : "font-medium"}>
                  {n.link ? (
                    <Link href={n.link} className="hover:underline">
                      {n.title}
                    </Link>
                  ) : (
                    n.title
                  )}
                </p>
                {n.body && <p className="mt-1 line-clamp-2 text-sm text-muted">{n.body}</p>}
                <p className="mt-1 text-xs text-muted">{formatDate(n.created_at)}</p>
              </div>
              <div className="flex gap-3 text-xs">
                {!n.read_at && (
                  <form action={markNotificationRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <button className="text-muted hover:text-ink">Mark read</button>
                  </form>
                )}
                <form action={deleteNotification}>
                  <input type="hidden" name="id" value={n.id} />
                  <button className="text-muted hover:text-red-700">Remove</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
