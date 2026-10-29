import { describe, expect, it } from "vitest";
import { allWorks } from "@/data/sample";
import { DEFAULT_FILTERS, artworksHref, filterWorks, filtersFromParams, filtersToParams, hasActiveFilters } from "./filter-works";

const works = allWorks();
const titles = (f: Partial<typeof DEFAULT_FILTERS>) => filterWorks(works, { ...DEFAULT_FILTERS, ...f }).map((x) => x.work.title);

describe("filterWorks", () => {
  it("returns every work with default filters", () => {
    expect(titles({})).toHaveLength(works.length);
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
  });

  it("filters by medium", () => {
    expect(titles({ medium: "Sculpture" })).toEqual([]);
    expect(titles({ medium: "Painting" })).toHaveLength(works.length);
  });

  it("matches any of several selected styles", () => {
    const fig = titles({ styles: ["Figurative"] });
    const min = titles({ styles: ["Minimalist"] });
    expect(min).toEqual([]);
    expect(titles({ styles: ["Figurative", "Minimalist"] })).toEqual(fig);
    expect(fig).toContain("Friki Olivia");
  });

  it("filters by subject and colour", () => {
    expect(titles({ subject: "Nature" }).sort()).toEqual(["Flora Flora", "Renatus"]);
    expect(titles({ colour: "pink" }).sort()).toEqual(["Purple Rain", "Teresa"]);
  });

  it("uses half-open price bands", () => {
    expect(titles({ price: "u15" })).not.toContain("Friki Olivia");
    expect(titles({ price: "m" })).toEqual(["Friki Olivia"]);
  });

  it("sorts by price", () => {
    const asc = filterWorks(works, { ...DEFAULT_FILTERS, sort: "price-asc" }).map((x) => x.work.price ?? 0);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
  });
});

describe("filters in the address", () => {
  it("round-trips every filter", () => {
    const f = {
      ...DEFAULT_FILTERS,
      medium: "Painting" as const,
      availableOnly: true,
      price: "m" as const,
      styles: ["Abstract" as const, "Minimalist" as const],
      subject: "Nature" as const,
      colour: "blue" as const,
      sort: "new" as const,
    };
    expect(filtersFromParams(filtersToParams(f))).toEqual(f);
  });

  it("ignores unknown values instead of breaking", () => {
    const f = filtersFromParams({ medium: "Video", style: ["Abstract", "Cubist"], colour: "teal", price: "cheap", sort: "random" });
    expect(f).toEqual({ ...DEFAULT_FILTERS, styles: ["Abstract"] });
  });

  it("builds links into filtered views", () => {
    expect(artworksHref({})).toBe("/artworks");
    expect(artworksHref({ subject: "Landscape & sea" })).toBe("/artworks?subject=Landscape+%26+sea");
    expect(artworksHref({ colour: "red" })).toBe("/artworks?colour=red");
  });
});
