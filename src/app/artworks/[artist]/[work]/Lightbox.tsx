"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/** The large artwork image; click or Enter opens it full screen on a dark ground. */
export function ArtworkStage({ src, alt, width, height, caption }: { src: string; alt: string; width: number; height: number; caption: string }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const opener = openerRef.current;
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${alt} full screen`}
        className="flex min-h-[300px] w-full cursor-zoom-in items-center justify-center bg-surface p-[clamp(24px,5vw,80px)] max-[899px]:-mx-4 max-[899px]:w-[calc(100%+32px)] max-[899px]:p-6"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority
          sizes="(max-width: 900px) 100vw, 60vw"
          className="h-auto max-h-[min(76vh,860px)] w-full object-contain"
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[150] flex animate-fade items-center justify-center bg-[rgba(10,10,10,.97)] px-4 py-16"
          onClick={() => setOpen(false)}
        >
          <button
            ref={closeRef}
            type="button"
            className="absolute top-[calc(env(safe-area-inset-top,0px)+18px)] right-5 text-[11px] tracking-[.22em] text-[#aaa] uppercase hover:text-white"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <p className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+20px)] left-5 text-[13px] text-[#aaa]">{caption}</p>
        </div>
      )}
    </>
  );
}
