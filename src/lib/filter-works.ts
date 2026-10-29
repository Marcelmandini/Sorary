import { isLifted, type ListedWork } from "@/lib/catalog";
import {
  COLOURS,
  MEDIUMS,
  PRICE_BANDS,
  STYLES,
  SUBJECTS,
  type ColourKey,
  type Medium,
  type PriceBandKey,
  type Style,
  type Subject,
} from "@/lib/taxonomy";

export type SortKey = "curated" | "new" | "price-asc" | "price-desc";
const SORTS: SortKey[] = ["curated", "new", "price-asc", "price-desc"];

export type WorkFilters = {
  medium: Medium | "All";
  availableOnly: boolean;
  price: PriceBandKey;
  styles: Style[];
  subject: Subject | "all";
  colour: ColourKey | null;
  sort: SortKey;
};

export const DEFAULT_FILTERS: WorkFilters = {
  medium: "All",
  availableOnly: false,
  price: "any",
  styles: [],
  subject: "all",
  colour: null,
  sort: "curated",
};

export function hasActiveFilters(f: WorkFilters): boolean {
  return (
    f.medium !== "All" || f.availableOnly || f.price !== "any" || f.styles.length > 0 || f.subject !== "all" || f.colour !== null
  );
}

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

const read = (p: Params, k: string): string[] => {
  if (p instanceof URLSearchParams) return p.getAll(k);
  const v = p[k];
  return v === undefined ? [] : Array.isArray(v) ? v : [v];
};

/**
 * Filters from the address, e.g. /artworks?style=Abstract&style=Minimalist&colour=blue&subject=Nature.
 * Unknown values are ignored, so a hand-edited link never breaks the page.
 */
export function filtersFromParams(p: Params): WorkFilters {
  const one = (k: string) => read(p, k)[0];
  const medium = one("medium");
  const price = one("price");
  const subject = one("subject");
  const colour = one("colour");
  const sort = one("sort");
  return {
    medium: (MEDIUMS as readonly string[]).includes(medium ?? "") ? (medium as Medium) : "All",
    availableOnly: one("available") === "1",
    price: PRICE_BANDS.some((b) => b.key === price) ? (price as PriceBandKey) : "any",
    styles: read(p, "style").filter((s): s is Style => (STYLES as readonly string[]).includes(s)),
    subject: (SUBJECTS as readonly string[]).includes(subject ?? "") ? (subject as Subject) : "all",
    colour: COLOURS.some((c) => c.key === colour) ? (colour as ColourKey) : null,
    sort: SORTS.includes(sort as SortKey) ? (sort as SortKey) : "curated",
  };
}

export function filtersToParams(f: WorkFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.medium !== "All") p.set("medium", f.medium);
  if (f.availableOnly) p.set("available", "1");
  if (f.price !== "any") p.set("price", f.price);
  f.styles.forEach((s) => p.append("style", s));
  if (f.subject !== "all") p.set("subject", f.subject);
  if (f.colour) p.set("colour", f.colour);
  if (f.sort !== "curated") p.set("sort", f.sort);
  return p;
}

/** Link into a filtered Artworks view, used on artwork pages. */
export function artworksHref(patch: Partial<WorkFilters>): string {
  const q = filtersToParams({ ...DEFAULT_FILTERS, ...patch }).toString();
  return q ? `/artworks?${q}` : "/artworks";
}

export function filterWorks(list: ListedWork[], f: WorkFilters, now = Date.now()): ListedWork[] {
  const band = PRICE_BANDS.find((b) => b.key === f.price) ?? PRICE_BANDS[0];
  const out = list.filter(({ work: w }) => {
    if (f.medium !== "All" && w.category !== f.medium) return false;
    if (f.availableOnly && w.availability !== "available") return false;
    // Several styles may be selected: a work matches if it has any of them.
    if (f.styles.length && !f.styles.some((s) => w.styles.includes(s))) return false;
    if (f.subject !== "all" && w.subject !== f.subject) return false;
    if (f.colour && !w.colours.includes(f.colour)) return false;
    if (w.price && (w.price < band.min || w.price >= band.max)) return false;
    return true;
  });

  const listed = (x: ListedWork) => new Date(x.work.listedAt).getTime();
  const price = (x: ListedWork) => x.work.price ?? 0;
  switch (f.sort) {
    case "new":
      return out.sort((p, q) => listed(q) - listed(p));
    case "price-asc":
      return out.sort((p, q) => price(p) - price(q));
    case "price-desc":
      return out.sort((p, q) => price(q) - price(p));
    default:
      // Curated: Lift placements first (labelled Sponsored), then available works, then newest.
      // Momentum joins this ordering in phase 6.
      return out.sort(
        (p, q) =>
          Number(isLifted(q.work, now)) - Number(isLifted(p.work, now)) ||
          Number(q.work.availability === "available") - Number(p.work.availability === "available") ||
          listed(q) - listed(p),
      );
  }
}
