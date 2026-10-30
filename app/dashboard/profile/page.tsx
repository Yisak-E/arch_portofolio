import { requireOwner } from "@/lib/auth";
import type { SiteProfile } from "@/lib/types";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const { supabase } = await requireOwner();
  const { data } = await supabase.from("site_profile").select("*").single();

  return (
    <div className="max-w-4xl">
      <h1 className="font-serif text-3xl">Profile</h1>
      <p className="mt-2 text-sm text-muted">What visitors see on the home and About pages.</p>
      <div className="mt-8">
        <ProfileForm profile={data as SiteProfile} />
      </div>
    </div>
  );
}
