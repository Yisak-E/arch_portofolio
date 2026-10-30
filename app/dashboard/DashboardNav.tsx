"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardNav({ unread }: { unread: number }) {
  const path = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {items.map((item) => {
        const active = item.href === "/dashboard" ? path === item.href : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm transition ${
              active ? "bg-paper text-ink" : "text-paper/70 hover:bg-white/10 hover:text-paper"
            }`}
          >
            {item.label}
            {item.label === "Messages" && unread > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">{unread}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
