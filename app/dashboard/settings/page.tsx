import { requireStaff } from "@/lib/auth";
import PasswordForm from "./PasswordForm";

export default async function SettingsPage() {
  const { user } = await requireStaff();

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-3xl">Settings</h1>

      <section className="mt-8 rounded-lg border border-line bg-panel p-6">
        <p className="label">Signed in as</p>
        <p>{user.email}</p>
      </section>

      <section className="mt-6 rounded-lg border border-line bg-panel p-6">
        <h2 className="font-serif text-xl">Change password</h2>
        <p className="mt-1 text-sm text-muted">
          If you sign in with Google you don&apos;t need a password, but you can set one here too.
        </p>
        <div className="mt-5">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
