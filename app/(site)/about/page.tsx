import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { SiteProfile } from "@/lib/types";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_profile").select("*").single();
  const p = data as SiteProfile | null;

  const details = [
    ["Education", p?.education],
    ["Credentials", p?.credentials],
    ["Based in", p?.location],
  ].filter(([, v]) => v) as [string, string][];

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

        {details.length > 0 && (
          <dl className="mt-10 grid gap-5 border-t border-line pt-6 text-sm sm:grid-cols-2">
            {details.map(([k, v]) => (
              <div key={k}>
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1 whitespace-pre-line">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {(p?.public_email || p?.phone || p?.website || p?.instagram_url || p?.linkedin_url) && (
          <ul className="mt-8 space-y-1 text-sm">
            {p?.public_email && (
              <li>
                <a href={`mailto:${p.public_email}`} className="underline">{p.public_email}</a>
              </li>
            )}
            {p?.phone && <li>{p.phone}</li>}
            {p?.website && (
              <li>
                <a href={p.website} target="_blank" rel="noreferrer" className="underline">Website</a>
              </li>
            )}
            {p?.instagram_url && (
              <li>
                <a href={p.instagram_url} target="_blank" rel="noreferrer" className="underline">Instagram</a>
              </li>
            )}
            {p?.linkedin_url && (
              <li>
                <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="underline">LinkedIn</a>
              </li>
            )}
          </ul>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/contact" className="btn">
            Contact me
          </Link>
          <Link href="/account/requests" className="btn-outline">
            Start a project request
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
