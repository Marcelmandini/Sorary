"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkCard } from "@/components/WorkCard";
import type { ListedWork } from "@/lib/catalog";
import { DEFAULT_FILTERS, filterWorks, filtersToParams, hasActiveFilters, type SortKey, type WorkFilters } from "@/lib/filter-works";
import { COLOURS, MEDIUMS, PRICE_BANDS, STYLES, SUBJECTS, type PriceBandKey, type Subject } from "@/lib/taxonomy";

// Filters run in the browser over the published catalogue (a few hundred works at most for now) and are
// mirrored in the address, so filtered views can be shared and linked from artwork pages.

export function ArtworkBrowser({ works, initialFilters }: { works: ListedWork[]; initialFilters: WorkFilters }) {
  const [f, setF] = useState<WorkFilters>(initialFilters);
  // On phones the secondary filters fold away so the works are visible on the first screen.
  const [panelOpen, setPanelOpen] = useState(false);
  const set = (patch: Partial<WorkFilters>) => setF((cur) => ({ ...cur, ...patch }));

  useEffect(() => {
    const q = filtersToParams(f).toString();
    const url = q ? `${window.location.pathname}?${q}` : window.location.pathname;
    if (url !== window.location.pathname + window.location.search) window.history.replaceState(null, "", url);
  }, [f]);
  const list = useMemo(() => filterWorks(works, f), [works, f]);
  const colourName = f.colour ? COLOURS.find((c) => c.key === f.colour)?.label.toLowerCase() : "";
  const secondaryCount =
    Number(f.availableOnly) + Number(f.price !== "any") + f.styles.length + Number(f.subject !== "all") + Number(!!f.colour);

  const sortSelect = (
    <select className="in in-sm" aria-label="Sort" value={f.sort} onChange={(e) => set({ sort: e.target.value as SortKey })}>
      <option value="curated">Curated</option>
      <option value="new">Newest</option>
      <option value="price-asc">Price, low to high</option>
      <option value="price-desc">Price, high to low</option>
    </select>
  );

  return (
    <>
      <div role="group" aria-label="Filters" className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-y border-line py-3.5">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] min-[760px]:mx-0 min-[760px]:flex-wrap min-[760px]:overflow-visible min-[760px]:px-0">
          {(["All", ...MEDIUMS] as const).map((m) => (
            <button key={m} type="button" className="chip shrink-0" aria-pressed={f.medium === m} onClick={() => set({ medium: m })}>
              {m}
            </button>
          ))}
        </div>

        <div className="flex w-full items-center justify-between gap-5 min-[760px]:hidden">
          <button
            type="button"
            className="text-[11px] font-normal tracking-[.22em] uppercase"
            aria-expanded={panelOpen}
            aria-controls="more-filters"
            onClick={() => setPanelOpen((o) => !o)}
          >
            Filters{secondaryCount > 0 && <span className="mono ml-1.5 text-muted">({secondaryCount})</span>}
            <span className="mono ml-2 text-muted" aria-hidden="true">
              {panelOpen ? "–" : "+"}
            </span>
          </button>
          {sortSelect}
        </div>

        <div className="hidden flex-wrap items-center gap-5 min-[760px]:flex">
          <AvailableAndPrice f={f} set={set} />
          {sortSelect}
        </div>
      </div>

      <div
        id="more-filters"
        className={`${panelOpen ? "flex" : "hidden"} flex-col gap-5 border-b border-line py-5 min-[760px]:flex min-[760px]:flex-row min-[760px]:flex-wrap min-[760px]:items-center min-[760px]:justify-between min-[760px]:gap-x-7 min-[760px]:gap-y-4 min-[760px]:py-3`}
      >
        <div className="flex flex-wrap items-center gap-5 min-[760px]:hidden">
          <AvailableAndPrice f={f} set={set} />
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="lbl text-[10px]" id="f-style">
            Style
          </span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="f-style">
            {STYLES.map((s) => {
              const on = f.styles.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  className="chip"
                  aria-pressed={on}
                  onClick={() => set({ styles: on ? f.styles.filter((x) => x !== s) : [...f.styles, s] })}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <label className="lbl text-[10px]" htmlFor="f-subject">
            Subject
          </label>
          <select
            id="f-subject"
            className="in in-sm"
            value={f.subject}
            onChange={(e) => set({ subject: e.target.value as Subject | "all" })}
          >
            <option value="all">All subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="lbl text-[10px]" id="f-colour">
            Colour
          </span>
          <div className="flex flex-wrap items-center gap-1" role="group" aria-labelledby="f-colour">
            {COLOURS.map((c) => (
              <button
                key={c.key}
                type="button"
                className="swatch"
                title={c.label}
                aria-label={c.label}
                aria-pressed={f.colour === c.key}
                onClick={() => set({ colour: f.colour === c.key ? null : c.key })}
              >
                <i style={{ background: c.hex }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-[22px] mb-7 flex flex-wrap items-baseline justify-between gap-4">
        <p className="hint mono" role="status">
          {list.length} {list.length === 1 ? "work" : "works"}
          {colourName && ` with ${colourName}`}
        </p>
        {hasActiveFilters(f) && (
          <button type="button" className="textbtn" onClick={() => setF({ ...DEFAULT_FILTERS, sort: f.sort })}>
            Clear filters
          </button>
        )}
      </div>

      {list.length ? (
        <div className="masonry">
          {list.map((x, i) => (
            <WorkCard key={x.work.id} {...x} priority={i < 4} />
          ))}
        </div>
      ) : works.length === 0 ? (
        <div className="flex flex-col items-center gap-3.5 border border-line px-6 py-[clamp(32px,6vw,72px)] text-center text-[#555]">
          <h3 className="text-2xl text-fg">The first works are on their way</h3>
          <p>Artists are setting up their studios. New works appear here as soon as they are published.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3.5 border border-line px-6 py-[clamp(32px,6vw,72px)] text-center text-[#555]">
          <h3 className="text-2xl text-fg">No works match</h3>
          <p>Try another style, subject or colour.</p>
        </div>
      )}
    </>
  );
}

function AvailableAndPrice({ f, set }: { f: WorkFilters; set: (patch: Partial<WorkFilters>) => void }) {
  return (
    <>
      <label className="check">
        <input type="checkbox" checked={f.availableOnly} onChange={(e) => set({ availableOnly: e.target.checked })} />
        Available only
      </label>
      <select className="in in-sm" aria-label="Price" value={f.price} onChange={(e) => set({ price: e.target.value as PriceBandKey })}>
        {PRICE_BANDS.map((b) => (
          <option key={b.key} value={b.key}>
            {b.label}
          </option>
        ))}
      </select>
    </>
  );
}
