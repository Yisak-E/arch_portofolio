import { requireUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import AccountNav from "./AccountNav";

export const metadata = { title: "Your account" };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile, isArchitect } = await requireUser("/account");

  const [{ count: unreadMessages }, { count: pendingInvites }] = await Promise.all([
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("client_id", user.id)
      .eq("client_unread", true),
    supabase
      .from("collaborator_invites")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .ilike("email", user.email ?? ""),
  ]);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[220px_1fr]">
      <aside>
        <p className="font-serif text-xl">{profile?.full_name || user.email}</p>
        <p className="eyebrow mt-1">{profile ? ROLE_LABELS[profile.role] : "Member"}</p>
        {profile?.is_suspended && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
            Your account is suspended. You can browse, but not send messages or requests.
          </p>
        )}
        <AccountNav
          showProjects={isArchitect}
          unreadMessages={unreadMessages ?? 0}
          pendingInvites={pendingInvites ?? 0}
        />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
