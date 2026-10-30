import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SiteFooter() {
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("site_profile")
    .select("full_name, instagram_url, linkedin_url")
    .single();

  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:px-6">
        <p>
          © {new Date().getFullYear()} {p?.full_name ?? "Portfolio"}
        </p>
        <div className="flex gap-5">
          {p?.instagram_url && (
            <a href={p.instagram_url} target="_blank" rel="noreferrer" className="hover:text-ink">
              Instagram
            </a>
          )}
          {p?.linkedin_url && (
            <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-ink">
              LinkedIn
            </a>
          )}
          <Link href="/contact" className="hover:text-ink">
            Get in touch
          </Link>
        </div>
      </div>
    </footer>
  );
}
