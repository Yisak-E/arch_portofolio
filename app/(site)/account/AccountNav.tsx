"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AccountNav({
  showProjects,
  unreadMessages,
  pendingInvites,
}: {
  showProjects: boolean;
  unreadMessages: number;
  pendingInvites: number;
}) {
  const path = usePathname();
  const items = [
    { href: "/account", label: "Profile" },
    { href: "/account/messages", label: "Messages", badge: unreadMessages },
    { href: "/account/requests", label: "Collaboration requests" },
    { href: "/account/notifications", label: "Notifications" },
    { href: "/account/invitations", label: "Invitations", badge: pendingInvites },
    ...(showProjects ? [{ href: "/account/projects", label: "My projects" }] : []),
  ];

  return (
    <nav className="mt-6 flex gap-1 overflow-x-auto md:flex-col">
      {items.map((item) => {
        const active = item.href === "/account" ? path === item.href : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm transition ${
              active ? "bg-ink text-paper" : "text-muted hover:bg-line/50 hover:text-ink"
            }`}
          >
            {item.label}
            {!!item.badge && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">{item.badge}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
