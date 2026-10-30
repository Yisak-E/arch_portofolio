"use client";

import { useActionState } from "react";
import AvatarUpload from "@/components/AvatarUpload";
import FormMessage from "@/components/FormMessage";
import SubmitButton from "@/components/SubmitButton";
import type { Architect, Profile } from "@/lib/types";
import { saveArchitectCard, savePersonalProfile } from "./actions";

export function PersonalProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(savePersonalProfile, undefined);
  return (
    <form action={action} className="space-y-5 rounded-lg border border-line bg-panel p-6">
      <AvatarUpload name="avatar_url" folder={`avatars/${profile.id}`} initialUrl={profile.avatar_url} label="Profile picture" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name *" name="full_name" value={profile.full_name} required />
        <Field label="Email" name="_email" value={profile.email} disabled />
        <Field label="Phone" name="phone" value={profile.phone} />
        <Field label="Company / organisation" name="company" value={profile.company} />
      </div>
      <div>
        <label className="label" htmlFor="bio">About you</label>
        <textarea id="bio" name="bio" rows={3} defaultValue={profile.bio ?? ""} className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}

export function ArchitectCardForm({ architect }: { architect: Architect }) {
  const [state, action] = useActionState(saveArchitectCard, undefined);
  return (
    <form action={action} className="space-y-5 rounded-lg border border-line bg-panel p-6">
      <AvatarUpload name="avatar_url" folder="architects" initialUrl={architect.avatar_url} label="Public picture" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name shown in credits *" name="name" value={architect.name} required />
        <Field label="Title" name="title" value={architect.title} placeholder="e.g. Architect, Studio Name" />
        <Field label="Website" name="website" value={architect.website} />
      </div>
      <div>
        <label className="label" htmlFor="arch_bio">Short bio</label>
        <textarea id="arch_bio" name="bio" rows={3} defaultValue={architect.bio ?? ""} className="input" />
      </div>
      <FormMessage state={state} />
      <SubmitButton>Save architect profile</SubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  required,
  disabled,
  placeholder,
}: {
  label: string;
  name: string;
  value: string | null;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={disabled ? undefined : name}
        defaultValue={value ?? ""}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`input ${disabled ? "bg-paper text-muted" : ""}`}
      />
    </div>
  );
}
