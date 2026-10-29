import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkCard } from "@/components/WorkCard";
import { ARTISTS, type Artist as SampleArtist } from "@/data/sample";
import type { ListedWork } from "@/lib/catalog";
import { getArtistBySlug, getCurrentUser, type ArtistRow } from "@/lib/data/artists";
import { getPublishedWorksFor, showSampleWorks, toArtist, toWork } from "@/lib/data/works";

// Profiles and works come from Supabase. In development (SHOW_SAMPLE_WORKS=true) the sample profile and
// works stand in for an address that has no database profile or no published works yet.

type Profile = {
  slug: string;
  name: string;
  city: string;
  country: string;
  medium: string;
  born: string;
  statement: string;
  bio: string;
  website: string;
  instagram: string;
  joinedAt: string;
  listed: boolean;
  ownerId: string | null;
};

const fromRow = (a: ArtistRow): Profile => ({
  slug: a.slug,
  name: a.name,
  city: a.city,
  country: a.country,
  medium: a.medium,
  born: a.born ? String(a.born) : "",
  statement: a.statement,
  bio: a.bio,
  website: a.website,
  instagram: a.instagram,
  joinedAt: a.created_at,
  listed: a.listed,
  ownerId: a.id,
});

const fromSample = (a: SampleArtist): Profile => ({
  slug: a.slug,
  name: a.name,
  city: a.city,
  country: a.country,
  medium: a.medium,
  born: a.born,
  statement: a.statement,
  bio: "",
  website: "",
  instagram: "",
  joinedAt: a.joinedAt,
  listed: true,
  ownerId: null,
});

async function loadProfile(slug: string): Promise<Profile | null> {
  const row = await getArtistBySlug(slug);
  if (row) return fromRow(row);
  const sample = showSampleWorks() ? ARTISTS.find((a) => a.slug === slug) : undefined;
  return sample ? fromSample(sample) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await loadProfile(slug);
  if (!p) return { title: "Artist not found" };
  return {
    title: p.name,
    description: p.statement || `Original works by ${p.name} on SORARY.`,
    robots: p.listed ? undefined : { index: false },
  };
}

const monthYear = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await loadProfile(slug);
  if (!p) notFound();

  const user = await getCurrentUser();
  const isOwner = !!user && user.id === p.ownerId;
  const row = p.ownerId ? await getArtistBySlug(slug) : null;
  let works: ListedWork[] = [];
  if (row) {
    const artist = toArtist(row, (await getPublishedWorksFor(row.id)).map(toWork));
    works = artist.works.map((work) => ({ artist, work }));
  }
  const sample = showSampleWorks() ? ARTISTS.find((a) => a.slug === p.slug) : undefined;
  if (!works.length && sample) works = sample.works.map((work) => ({ artist: sample, work }));
  const available = works.filter((x) => x.work.availability === "available").length;
  const meta = [[p.city, p.country].filter(Boolean).join(", "), p.born && `b. ${p.born}`, `On SORARY since ${monthYear(p.joinedAt)}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {isOwner && !p.listed && (
        <p className="mt-8 border border-line bg-surface px-5 py-4 text-sm text-[#555]" role="status">
          <b className="font-normal text-fg">Only you can see this page.</b> Your profile is hidden from the marketplace.
          Turn on “Listed” in your studio to publish it.
        </p>
      )}

      <section className="grid grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] pt-[clamp(48px,7vw,104px)] pb-10 min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <span className="eyebrow">Artist · {p.medium}</span>
          <h1 className="mt-[18px] text-[clamp(44px,6.4vw,96px)] leading-[.98] tracking-[-.03em] break-words">{p.name}</h1>
          <p className="mt-5 text-[14.5px] text-muted">{meta}</p>
          {p.statement && <p className="mt-7 max-w-[42ch] text-[clamp(18px,1.7vw,22px)] leading-normal text-[#333]">{p.statement}</p>}
          {isOwner && (
            <div className="mt-8">
              <Link href="/studio/profile" className="btn btn-outline">
                Edit profile
              </Link>
            </div>
          )}
        </div>

        <aside className="border-t border-fg pt-4">
          <span className="lbl">Artist Momentum</span>
          <p className="mt-3.5 text-[17px]">New on SORARY</p>
          <p className="hint mt-2">
            Momentum appears once collectors start visiting, saving and following. It is calculated only from genuine
            activity.
          </p>
        </aside>
      </section>

      <div className="grid grid-cols-2 border-y border-line">
        <div className="flex flex-col gap-1.5 py-4 pr-4">
          <span className="lbl">Works</span>
          <b className="mono text-2xl font-light">{works.length}</b>
        </div>
        <div className="flex flex-col gap-1.5 border-l border-line py-4 pl-4">
          <span className="lbl">Available</span>
          <b className="mono text-2xl font-light">{available}</b>
        </div>
      </div>

      <section className="pt-[clamp(64px,8vw,120px)]">
        <h2 className="mb-[clamp(24px,3vw,40px)] text-[clamp(24px,2.4vw,34px)] leading-[1.15] tracking-[-.015em]">Works</h2>
        {works.length ? (
          <div className="masonry min-[1100px]:columns-3">
            {works.map((x) => (
              <WorkCard key={x.work.id} {...x} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3.5 border border-line px-6 py-[clamp(32px,6vw,72px)] text-center text-[#555]">
            <h3 className="text-2xl text-fg">No works listed yet</h3>
            {isOwner && (
              <Link href="/studio/works" className="btn btn-outline mt-2">
                Add works
              </Link>
            )}
          </div>
        )}
      </section>

      {(p.bio || p.website || p.instagram) && (
        <section className="pt-[clamp(64px,8vw,120px)]">
          <span className="eyebrow">About</span>
          {p.bio && (
            <p className="mt-[18px] max-w-[62ch] text-[clamp(17px,1.5vw,19px)] leading-[1.75] whitespace-pre-line">{p.bio}</p>
          )}
          {(p.website || p.instagram) && (
            <p className="mt-6 flex flex-wrap gap-6 text-sm">
              {p.website && (
                <a href={p.website} rel="noopener nofollow ugc" target="_blank" className="border-b border-line hover:border-fg">
                  {p.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
              {p.instagram && (
                <a
                  href={`https://instagram.com/${p.instagram}`}
                  rel="noopener nofollow ugc"
                  target="_blank"
                  className="border-b border-line hover:border-fg"
                >
                  @{p.instagram}
                </a>
              )}
            </p>
          )}
        </section>
      )}
    </>
  );
}
