import Image from "next/image";
import Link from "next/link";
import { artistHref, isLifted, workHref, type ListedWork } from "@/data/sample";
import { formatPrice } from "@/lib/format";

export function WorkPrice({ work }: { work: ListedWork["work"] }) {
  if (work.availability === "sold") return <span className="text-[13px] text-sold">Sold</span>;
  if (work.availability === "reserved") return <span className="text-[13px] text-muted">Reserved</span>;
  return <span className="mono text-[13px]">{formatPrice(work.price, work.currency)}</span>;
}

export function WorkCard({ artist, work, priority = false }: ListedWork & { priority?: boolean }) {
  return (
    <article className="group relative mb-[clamp(32px,4vw,56px)] break-inside-avoid">
      <Link
        href={workHref(artist, work)}
        aria-label={`${work.title} by ${artist.name}`}
        className="flex items-center justify-center bg-surface p-[clamp(14px,1.8vw,26px)]"
      >
        <Image
          src={work.src}
          alt={work.alt}
          width={work.width}
          height={work.height}
          priority={priority}
          sizes="(max-width: 760px) 45vw, (max-width: 1100px) 30vw, 300px"
          className="h-auto w-full transition-transform duration-1000 ease-gallery group-hover:scale-[1.015]"
        />
      </Link>
      <div className="mt-3 flex flex-col gap-px text-[13.5px] leading-[1.45]">
        {isLifted(work) && <span className="sponsored mb-0.5">Sponsored</span>}
        <Link href={artistHref(artist)} className="font-normal">
          {artist.name}
        </Link>
        <Link href={workHref(artist, work)} className="text-[#333]">
          <i>{work.title}</i>, {work.year}
        </Link>
        <span className="text-[12.5px] text-muted">
          {work.medium}
          {work.dimensions && ` · ${work.dimensions}`}
        </span>
        <span className="mt-1">
          <WorkPrice work={work} />
        </span>
      </div>
    </article>
  );
}
