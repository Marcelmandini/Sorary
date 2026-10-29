import Link from "next/link";

export function SectionHead({
  title,
  sub,
  link,
}: {
  title: string;
  sub?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-end justify-between gap-5">
      <div>
        <h2 className="text-[clamp(24px,2.4vw,34px)] leading-[1.15] tracking-[-.015em]">{title}</h2>
        {sub && <p className="mt-1.5 text-[14.5px] text-muted">{sub}</p>}
      </div>
      {link && (
        <Link href={link.href} className="link">
          {link.label}
        </Link>
      )}
    </div>
  );
}
