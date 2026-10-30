import Link from "next/link";
import { getSession } from "@/lib/auth";
import ContactForm from "./ContactForm";

export const metadata = { title: "Contact" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project: projectSlug } = await searchParams;
  const { supabase, user } = await getSession();

  let project: { id: string; title: string } | null = null;
  if (projectSlug) {
    const { data } = await supabase
      .from("projects")
      .select("id, title")
      .eq("slug", projectSlug)
      .maybeSingle();
    project = data;
  }

  const here = projectSlug ? `/contact?project=${encodeURIComponent(projectSlug)}` : "/contact";
  const nextParam = encodeURIComponent(here);

  let defaultName = "";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    defaultName = profile?.full_name ?? "";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-3 font-serif text-4xl">Let&apos;s talk</h1>
      <p className="mt-4 text-muted">
        For collaborations, internships, commissions or questions about a project.
        {project && (
          <>
            {" "}You&apos;re writing about <strong className="text-ink">{project.title}</strong>.
          </>
        )}
      </p>

      {user && (
        <p className="mt-4 text-sm text-muted">
          Planning a project together?{" "}
          <Link href="/account/requests" className="text-ink underline">
            Send a collaboration request
          </Link>{" "}
          to track its status.{" "}
          <Link href="/account/messages" className="text-ink underline">
            Your conversations
          </Link>
        </p>
      )}

      <div className="mt-10">
        {user ? (
          <ContactForm defaultName={defaultName} email={user.email ?? ""} project={project} />
        ) : (
          <div className="rounded-lg border border-line bg-panel p-8">
            <p className="font-serif text-2xl">Sign in to send a message</p>
            <p className="mt-2 text-muted">
              Signing in keeps her inbox free of spam and lets her reply to you directly. It only takes a moment
              with Google or your email.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/login?next=${nextParam}`} className="btn">
                Sign in
              </Link>
              <Link href={`/register?next=${nextParam}`} className="btn-outline">
                Create an account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
