import Image from "next/image";
import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";
import { WorkCard } from "@/components/WorkCard";
import { ARTISTS, allWorks, artistHref, isLifted, workHref } from "@/data/sample";

// Static Discover page. Momentum (ticker, trending, emerging) is calculated from genuine activity in
// phase 6; until then those sections show their honest empty states instead of invented numbers.

export default function HomePage() {
  const works = allWorks();
  const available = works.filter((x) => x.work.availability !== "sold");
  const lead = ARTISTS[0];
  const featured = lead.works.find((w) => w.availability === "available" && w.width <= w.height) ?? lead.works[0];
  const sponsored = available.filter((x) => isLifted(x.work)).slice(0, 4);
  const newest = [...available]
    .sort((p, q) => new Date(q.work.listedAt).getTime() - new Date(p.work.listedAt).getTime())
    .slice(0, 8);

  return (
    <>
      <section className="grid grid-cols-12 items-end gap-6 pt-[clamp(48px,8vw,112px)] pb-[clamp(48px,6vw,88px)]">
        <div className="col-span-12 self-center min-[900px]:col-span-6">
          <span className="eyebrow animate-rise">Original contemporary art</span>
          <h1 className="mt-[22px] max-w-[9ch] animate-rise text-[clamp(44px,6.6vw,104px)] leading-[.98] tracking-[-.03em] [animation-delay:80ms]">
            Collect the artists of now.
          </h1>
          <p className="mt-8 max-w-[44ch] animate-rise text-[clamp(16px,1.4vw,19px)] text-[#444] [animation-delay:160ms]">
            Original works directly from studios across Europe and beyond. Follow the artists you believe in, and see
            whose work is gathering attention through Artist Momentum.
          </p>
          <div className="mt-10 flex animate-rise flex-wrap gap-3.5 [animation-delay:240ms]">
            <Link href="/artworks" className="btn">
              Explore artworks
            </Link>
            <Link href="/momentum" className="btn btn-outline">
              Artist Momentum
            </Link>
          </div>
        </div>

        {featured && (
          <figure className="col-span-12 m-0 animate-rise [animation-delay:160ms] min-[900px]:col-span-5 min-[900px]:col-start-8">
            <Link href={workHref(lead, featured)} className="flex justify-center bg-surface p-[clamp(20px,3vw,44px)]">
              <Image
                src={featured.src}
                alt={featured.alt}
                width={featured.width}
                height={featured.height}
                priority
                sizes="(max-width: 900px) 90vw, 40vw"
                className="h-auto max-h-[min(66vh,640px)] w-full object-contain"
              />
            </Link>
            <figcaption className="mt-3.5 flex items-end justify-between gap-4 text-[13.5px] leading-normal">
              <span>
                <Link href={artistHref(lead)} className="font-normal">
                  {lead.name}
                </Link>
                <br />
                <i>{featured.title}</i>, {featured.year} · {featured.medium}
              </span>
              <span className="flex flex-col items-end gap-0.5 text-right">
                <span className="lbl">Featured artist</span>
                <Link href={artistHref(lead)} className="link">
                  View works
                </Link>
              </span>
            </figcaption>
          </figure>
        )}
      </section>

      <section aria-label="Artist Momentum" className="flex flex-wrap items-baseline justify-between gap-4 border-t border-fg border-b border-b-line py-4 text-[13.5px]">
        <span className="text-muted">
          Artist Momentum appears here once there is genuine activity on SORARY.
        </span>
        <Link href="/momentum" className="text-[11px] font-normal tracking-[.2em] whitespace-nowrap uppercase">
          How it works →
        </Link>
      </section>

      <section className="pt-[clamp(64px,8vw,120px)]">
        <SectionHead
          title="Trending this month"
          sub="Artists whose momentum grew most over the last 30 days."
          link={{ href: "/momentum", label: "Momentum" }}
        />
        <p className="text-muted">Trending artists appear once there is activity on the platform.</p>
      </section>

      {sponsored.length > 0 && (
        <section className="pt-[clamp(64px,8vw,120px)]">
          <SectionHead title="Featured by artists" sub="Sponsored placements. They never affect Artist Momentum." />
          <div className="masonry">
            {sponsored.map((x) => (
              <WorkCard key={x.work.id} {...x} />
            ))}
          </div>
        </section>
      )}

      <section className="pt-[clamp(64px,8vw,120px)]">
        <SectionHead
          title="New to SORARY"
          sub="Recently listed works, available now."
          link={{ href: "/artworks", label: "All artworks" }}
        />
        <div className="masonry">
          {newest.map((x) => (
            <WorkCard key={x.work.id} {...x} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 items-start gap-[clamp(32px,6vw,96px)] pt-[clamp(64px,8vw,120px)] min-[900px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          {/* Becomes "Emerging" (joined in the last twelve months, growing following) once Momentum exists. */}
          <SectionHead title="New artists" sub="Recently joined SORARY." />
          <div className="border-t border-line">
            {ARTISTS.map((a) => (
              <Link
                key={a.id}
                href={artistHref(a)}
                className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4 border-b border-line py-3 hover:bg-surface"
              >
                <span className="flex size-[52px] items-center justify-center bg-surface p-1.5">
                  <Image
                    src={a.works[0].src}
                    alt=""
                    width={a.works[0].width}
                    height={a.works[0].height}
                    sizes="52px"
                    className="size-full object-contain"
                  />
                </span>
                <span className="flex min-w-0 flex-col text-[15px]">
                  {a.name}
                  <span className="text-[12.5px] text-muted">
                    {a.city} · {a.medium}
                  </span>
                </span>
                <span className="hint">New on SORARY</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start gap-[18px] bg-surface p-[clamp(28px,4vw,48px)]">
          <span className="eyebrow">For artists</span>
          <h2 className="text-[clamp(26px,2.6vw,36px)] leading-[1.1] tracking-[-.015em]">Sell for free. See who is looking.</h2>
          <p className="max-w-[40ch] text-[#555]">
            No listing fee and no commission: you receive the full price of every work you sell. Every artist gets a
            studio with real analytics, day by day.
          </p>
          <div className="flex flex-wrap items-center gap-[18px]">
            <Link href="/sell" className="btn">
              Join as an artist
            </Link>
            <Link href="/sell" className="link">
              How it works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
