import { requireStaff } from "@/lib/auth";
import type { SiteProfile } from "@/lib/types";
import ConfirmButton from "../ConfirmButton";
import { clearProfile } from "./actions";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("site_profile").select("*").single();

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl">Profile</h1>
      <p className="mt-2 text-sm text-muted">What visitors see on the home and About pages.</p>
      <div className="mt-8">
        <ProfileForm profile={data as SiteProfile} />
      </div>
      <form action={clearProfile} className="mt-12 border-t border-line pt-6 text-sm">
        <p className="mb-2 text-muted">Remove all public profile information, including the portrait.</p>
        <ConfirmButton message="Clear the whole public profile? This can't be undone.">Clear profile</ConfirmButton>
      </form>
    </div>
  );
}
