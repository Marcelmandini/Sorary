import Link from "next/link";
import type { ReactNode } from "react";
import type { ArtistRow } from "@/lib/data/artists";

const ITEMS = [
  { key: "profile", href: "/studio/profile", label: "Profile", ready: true },
  { key: "works", href: "/studio/works", label: "Works", ready: false },
  { key: "inquiries", href: "/studio/inquiries", label: "Inquiries", ready: false },
  { key: "analytics", href: "/studio/analytics", label: "Analytics", ready: false },
] as const;

export function StudioShell({
  artist,
  active,
  title,
  aside,
  children,
}: {
  artist: ArtistRow;
  active: (typeof ITEMS)[number]["key"];
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const nav = (
    <>
      {ITEMS.map((it) =>
        it.ready ? (
          <Link key={it.key} href={it.href} aria-current={active === it.key ? "page" : undefined} className="studio-link">
            {it.label}
          </Link>
        ) : (
          <span key={it.key} className="studio-link text-[#b5b5b5]" title="Coming in a later phase">
            {it.label}
            <span className="ml-auto text-[10px] tracking-[.18em] uppercase min-[900px]:inline max-[899px]:hidden">Soon</span>
          </span>
        ),
      )}
    </>
  );

  return (
    <div className="grid grid-cols-1 gap-x-[clamp(28px,4vw,64px)] pt-[clamp(28px,4vw,48px)] min-[900px]:grid-cols-[200px_minmax(0,1fr)]">
      <aside className="max-[899px]:hidden">
        <div className="sticky top-28 flex flex-col gap-10">
          <nav aria-label="Studio" className="flex flex-col gap-0.5">
            {nav}
          </nav>
          <div className="flex flex-col items-start gap-3.5">
            <Link href={`/artists/${artist.slug}`} className="btn btn-sm btn-outline">
              View public profile
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="textbtn">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <nav
          aria-label="Studio"
          className="-mx-4 mb-6 flex gap-[22px] overflow-x-auto border-b border-line px-4 pb-3.5 [scrollbar-width:none] min-[900px]:hidden"
        >
          {nav}
        </nav>

        <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-7">
          <div>
            <span className="eyebrow mb-3 block">Studio · {artist.name}</span>
            <h1 className="text-[clamp(30px,3.4vw,44px)] leading-[1.08] tracking-[-.015em]">{title}</h1>
          </div>
          {aside}
        </div>
        {children}

        <div className="mt-16 flex flex-wrap items-center gap-5 border-t border-line pt-6 min-[900px]:hidden">
          <Link href={`/artists/${artist.slug}`} className="btn btn-sm btn-outline">
            View public profile
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="textbtn">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
