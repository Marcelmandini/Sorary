import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtworkStage } from "./Lightbox";
import { buyerProtection, buyerTotal } from "@/config/fees";
import { artistHref, workHref } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/data/artists";
import { getWork } from "@/lib/data/works";
import { artworksHref } from "@/lib/filter-works";
import { formatPrice } from "@/lib/format";
import { AVAILABILITY, COLOURS } from "@/lib/taxonomy";

type Params = Promise<{ artist: string; work: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { artist, work } = await params;
  const x = await getWork(artist, work);
  if (!x) return { title: "Artwork not found" };
  return {
    title: `${x.work.title} by ${x.artist.name}`,
    description: x.work.description || `${x.work.title}, ${x.work.year}. ${x.work.medium}. Original work by ${x.artist.name} on SORARY.`,
    openGraph: { images: [{ url: x.work.src, width: x.work.width, height: x.work.height, alt: x.work.alt }] },
  };
}

export default async function ArtworkPage({ params }: { params: Params }) {
  const { artist: artistSlug, work: workSlug } = await params;
  const found = await getWork(artistSlug, workSlug);
  if (!found) notFound();
  const { artist, work } = found;

  const user = await getCurrentUser();
  const isOwner = !!user && user.id === artist.id;
  const siblings = artist.works.filter((w) => !w.draft || w.id === work.id);
  const i = siblings.findIndex((w) => w.id === work.id);
  const prev = i > 0 ? siblings[i - 1] : null;
  const next = i >= 0 && i < siblings.length - 1 ? siblings[i + 1] : null;
  const caption = [artist.name, `${work.title}, ${work.year}`].join(" · ");
  const forSale = work.availability === "available" && !!work.price;

  const details: [string, React.ReactNode][] = [
    ["Year", work.year],
    ["Medium", work.medium],
    ["Dimensions", work.dimensions],
    [
      "Category",
      <Link key="c" href={artworksHref({ medium: work.category })} className="border-b border-line hover:border-fg">
        {work.category}
      </Link>,
    ],
    [
      "Style",
      work.styles.length ? (
        <span key="s" className="flex flex-wrap gap-x-3">
          {work.styles.map((s) => (
            <Link key={s} href={artworksHref({ styles: [s] })} className="border-b border-line hover:border-fg">
              {s}
            </Link>
          ))}
        </span>
      ) : null,
    ],
    [
      "Subject",
      work.subject ? (
        <Link key="su" href={artworksHref({ subject: work.subject })} className="border-b border-line hover:border-fg">
          {work.subject}
        </Link>
      ) : null,
    ],
    [
      "Colour",
      work.colours.length ? (
        <span key="co" className="flex flex-wrap items-center gap-1">
          {work.colours.map((k) => {
            const c = COLOURS.find((x) => x.key === k)!;
            return (
              <Link key={k} href={artworksHref({ colour: k })} className="swatch size-6" title={`More works with ${c.label.toLowerCase()}`} aria-label={`More works with ${c.label.toLowerCase()}`}>
                <i className="!size-4" style={{ background: c.hex }} />
              </Link>
            );
          })}
        </span>
      ) : null,
    ],
  ];

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex gap-2.5 pt-7 text-[12.5px] text-muted">
        <Link href="/artworks" className="hover:text-fg">
          Artworks
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={artistHref(artist)} className="hover:text-fg">
          {artist.name}
        </Link>
      </nav>

      {work.draft && (
        <p className="mt-6 border border-line bg-surface px-5 py-4 text-sm text-[#555]" role="status">
          <b className="font-normal text-fg">Draft. Only you can see this page.</b> Publish it in your studio to show it in
          Artworks.
        </p>
      )}

      <div className="grid grid-cols-1 items-start gap-[clamp(28px,5vw,88px)] pt-7 min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <ArtworkStage src={work.src} alt={work.alt} width={work.width} height={work.height} caption={caption} />

        <div className="flex flex-col gap-[22px] min-[900px]:sticky min-[900px]:top-24">
          <div className="flex flex-wrap items-baseline gap-3.5">
            <Link href={artistHref(artist)} className="border-b border-line text-base font-normal hover:border-fg">
              {artist.name}
            </Link>
            {artist.city && <span className="text-[13px] text-muted">{artist.city}</span>}
          </div>
          <h1 className="text-[clamp(28px,2.8vw,40px)] leading-[1.12] tracking-[-.015em]">
            <i>{work.title}</i>
            {work.year && <span className="text-muted">, {work.year}</span>}
          </h1>

          <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-[22px] gap-y-2 text-sm">
            {details
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="pt-[3px] text-[10.5px] font-normal tracking-[.2em] text-muted uppercase">{k}</dt>
                  <dd className="m-0">{v}</dd>
                </div>
              ))}
          </dl>

          <div className="border-t border-line pt-5">
            {work.availability === "available" ? (
              <p className="mono text-[28px] tracking-[-.01em]">{formatPrice(work.price)}</p>
            ) : (
              <p className={`text-xl ${work.availability === "sold" ? "text-sold" : "text-muted"}`}>{AVAILABILITY[work.availability]}</p>
            )}
          </div>

          {forSale && (
            <>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn" disabled aria-describedby="buy-note">
                  Buy now
                </button>
              </div>
              <p id="buy-note" className="hint -mt-2">
                Purchases with buyer protection open soon.
              </p>
              <p className="flex items-start gap-2.5 text-[13px] leading-normal text-[#555]">
                <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" className="mt-0.5 shrink-0 text-fg">
                  <path d="M8 1.5 2.5 3.5v4c0 3.3 2.3 5.9 5.5 7 3.2-1.1 5.5-3.7 5.5-7v-4z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="m5.6 8 1.7 1.7 3.2-3.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span>
                  Buyer protection {formatPrice(buyerProtection(work.price!))} is added at checkout, for a total of{" "}
                  <span className="mono">{formatPrice(buyerTotal(work.price!))}</span> before shipping. The artist receives
                  the full price.
                </span>
              </p>
            </>
          )}

          {work.description && <p className="max-w-[52ch] text-[15px] leading-[1.7] whitespace-pre-line text-[#444]">{work.description}</p>}

          {work.sample && <p className="hint">Sample listing for development. Not for sale.</p>}
          {isOwner && (
            <Link href="/studio/works" className="textbtn">
              Edit in your studio
            </Link>
          )}
        </div>
      </div>

      {(prev || next) && (
        <nav aria-label="More by this artist" className="mt-[clamp(40px,6vw,80px)] flex flex-wrap justify-between gap-4 border-t border-line pt-[18px] text-[13px] text-muted">
          {prev ? (
            <Link href={workHref(artist, prev)} className="hover:text-fg">
              ← <i>{prev.title}</i>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={workHref(artist, next)} className="hover:text-fg">
              <i>{next.title}</i> →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
