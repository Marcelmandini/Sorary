import type { ListedWork } from "@/data/sample";
import { isLifted } from "@/data/sample";
import { PRICE_BANDS, type ColourKey, type Medium, type PriceBandKey, type Style, type Subject } from "@/lib/taxonomy";

export type SortKey = "curated" | "new" | "price-asc" | "price-desc";

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
  switch (f.sort) {
    case "new":
      return out.sort((p, q) => listed(q) - listed(p));
    case "price-asc":
      return out.sort((p, q) => p.work.price - q.work.price);
    case "price-desc":
      return out.sort((p, q) => q.work.price - p.work.price);
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
