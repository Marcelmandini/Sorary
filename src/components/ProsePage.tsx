import type { ReactNode } from "react";

/** Long-form text page: About, Buyer protection, Privacy Policy, Terms. */
export function ProsePage({
  eyebrow,
  title,
  note,
  children,
}: {
  eyebrow: string;
  title: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="py-[clamp(56px,9vw,128px)]">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="mt-[18px] mb-8 max-w-[14ch] text-[clamp(40px,6vw,84px)] leading-none tracking-[-.02em]">{title}</h1>
      {note && <p className="mb-10 inline-block border border-line px-3.5 py-2 text-[12.5px] text-muted">{note}</p>}
      <div className="prose-sorary">{children}</div>
    </article>
  );
}
