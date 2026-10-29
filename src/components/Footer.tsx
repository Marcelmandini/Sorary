import Link from "next/link";
import { Logo } from "./Logo";
import { CopyEmail } from "./CopyEmail";
import { FOOTER_NAV } from "./nav";
import { SUPPORT_EMAIL } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-[clamp(72px,9vw,140px)] border-t border-line">
      <div className="wrap flex flex-wrap items-start justify-between gap-8 pt-12 pb-[calc(env(safe-area-inset-bottom,0px)+40px)]">
        <Link href="/" aria-label="SORARY home">
          <Logo />
        </Link>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-3">
          {FOOTER_NAV.map((l) => (
            <Link key={l.href} href={l.href} className="text-[12.5px] text-[#555] hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="w-full text-xs text-muted">
          <p className="mb-1.5 inline-flex flex-wrap items-baseline gap-1.5 text-[#555]">
            Contact <CopyEmail email={SUPPORT_EMAIL} />
          </p>
          <p>
            © {new Date().getFullYear()} SORARY · Original contemporary art. Showing genuine platform activity only.
          </p>
        </div>
      </div>
    </footer>
  );
}
