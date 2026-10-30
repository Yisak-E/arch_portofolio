"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Counts = { messages: number; requests: number; reports: number };

const groups: { title?: string; items: { href: string; label: string; count?: keyof Counts }[] }[] = [
  {
    items: [
      { href: "/dashboard", label: "Overview" },
      { href: "/dashboard/projects", label: "Projects" },
      { href: "/dashboard/collaborators", label: "Collaborators" },
      { href: "/dashboard/messages", label: "Messages", count: "messages" },
      { href: "/dashboard/requests", label: "Requests", count: "requests" },
      { href: "/dashboard/profile", label: "Profile" },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/dashboard/users", label: "Users" },
      { href: "/dashboard/reports", label: "Reports", count: "reports" },
      { href: "/dashboard/audit", label: "Audit log" },
      { href: "/dashboard/settings", label: "Settings" },
    ],
  },
];

export default function DashboardNav({ counts }: { counts: Counts }) {
  const path = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:gap-4">
      {groups.map((g, gi) => (
        <div key={gi} className="flex gap-1 md:flex-col">
          {g.title && <p className="hidden px-3 pb-1 text-[11px] uppercase tracking-widest text-paper/40 md:block">{g.title}</p>}
          {g.items.map((item) => {
            const active = item.href === "/dashboard" ? path === item.href : path.startsWith(item.href);
            const n = item.count ? counts[item.count] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm transition ${
                  active ? "bg-paper text-ink" : "text-paper/70 hover:bg-white/10 hover:text-paper"
                }`}
              >
                {item.label}
                {n > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">{n}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
