import { requireUser } from "@/lib/auth";
import type { Architect, Profile } from "@/lib/types";
import { ArchitectCardForm, PersonalProfileForm } from "./ProfileForms";

export default async function AccountPage() {
  const { supabase, user } = await requireUser("/account");

  const [{ data: profile }, { data: architect }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("architects").select("*").eq("profile_id", user.id).maybeSingle(),
  ]);

  return (
    <div className="max-w-3xl space-y-10">
      <section>
        <h1 className="font-serif text-3xl">Your profile</h1>
        <p className="mt-1 text-sm text-muted">Only you and the site administrators can see these details.</p>
        <div className="mt-6">
          <PersonalProfileForm profile={profile as Profile} />
        </div>
      </section>

      {architect && (
        <section>
          <h2 className="font-serif text-2xl">Architect profile</h2>
          <p className="mt-1 text-sm text-muted">This is public — it appears in the credits of projects you worked on.</p>
          <div className="mt-6">
            <ArchitectCardForm architect={architect as Architect} />
          </div>
        </section>
      )}
    </div>
  );
}
