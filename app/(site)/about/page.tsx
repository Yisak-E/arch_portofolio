import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { SiteProfile } from "@/lib/types";

export const metadata = { title: "About" };
export const revalidate = 60;

export default async function AboutPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_profile").select("*").single();
  const p = data as SiteProfile | null;

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1.4fr]">
      <div className="relative aspect-[4/5] overflow-hidden bg-line">
        {p?.avatar_url ? (
          <Image src={p.avatar_url} alt={p.full_name} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Portrait</div>
        )}
      </div>

      <div>
        <p className="eyebrow">{p?.headline ?? "About"}</p>
        <h1 className="mt-3 font-serif text-4xl">{p?.full_name}</h1>
        {p?.bio && <div className="mt-6 whitespace-pre-line leading-8">{p.bio}</div>}

        <dl className="mt-10 grid gap-5 border-t border-line pt-6 text-sm sm:grid-cols-2">
          {p?.education && (
            <div>
              <dt className="eyebrow">Education</dt>
              <dd className="mt-1 whitespace-pre-line">{p.education}</dd>
            </div>
          )}
          {p?.location && (
            <div>
              <dt className="eyebrow">Based in</dt>
              <dd className="mt-1">{p.location}</dd>
            </div>
          )}
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/contact" className="btn">
            Contact me
          </Link>
          {p?.cv_url && (
            <a href={p.cv_url} target="_blank" rel="noreferrer" className="btn-outline">
              Download CV
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
