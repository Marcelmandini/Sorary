"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MAIN_NAV, SECONDARY_NAV, isActive } from "./nav";

const navLink =
  "relative text-[11px] font-normal uppercase tracking-[.24em] text-[#555] transition-colors duration-200 hover:text-fg aria-[current=page]:text-fg " +
  "aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:right-[.24em] aria-[current=page]:after:-bottom-1.5 aria-[current=page]:after:h-px aria-[current=page]:after:bg-fg aria-[current=page]:after:content-['']";

export function Header({ logo }: { logo: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const menuBtn = menuBtnRef.current;
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      menuBtn?.focus();
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg pt-[env(safe-area-inset-top,0px)]">
      <div className="wrap flex items-center justify-between gap-6 py-6">
        <Link href="/" aria-label="SORARY home">
          {logo}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-[30px] min-[1000px]:flex">
          {MAIN_NAV.map((l) => (
            <Link key={l.href} href={l.href} className={navLink} aria-current={isActive(pathname, l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
          <span className="h-3.5 w-px bg-line" aria-hidden="true" />
          {SECONDARY_NAV.map((l) => (
            <Link key={l.href} href={l.href} className={navLink} aria-current={isActive(pathname, l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          ref={menuBtnRef}
          type="button"
          className="text-[11px] font-normal uppercase tracking-[.24em] min-[1000px]:hidden"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          Menu
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-80 flex animate-fade flex-col bg-bg px-[max(20px,env(safe-area-inset-right,0px))] pt-[calc(env(safe-area-inset-top,0px)+24px)] pb-[calc(env(safe-area-inset-bottom,0px)+32px)]"
        >
          <div className="flex items-center justify-between">
            {logo}
            <button ref={closeRef} type="button" className="text-[11px] font-normal uppercase tracking-[.24em]" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-auto flex flex-col gap-1.5">
            {[...MAIN_NAV, ...SECONDARY_NAV].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(pathname, l.href) ? "page" : undefined}
                className="text-[40px] leading-[1.25] font-light tracking-[-.01em] aria-[current=page]:underline aria-[current=page]:decoration-1 aria-[current=page]:underline-offset-8"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
