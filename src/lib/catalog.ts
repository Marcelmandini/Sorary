import type { Availability, ColourKey, Medium, Style, Subject } from "@/lib/taxonomy";

// The shape every page uses for artists and works, whether they come from Supabase or the sample file.

export type Work = {
  id: string;
  slug: string;
  title: string;
  year: string;
  medium: string;
  category: Medium;
  dimensions: string;
  price: number | null;
  currency: "SEK";
  availability: Availability;
  description: string;
  alt: string;
  /** Full-size image (up to 2400px). */
  src: string;
  /** Smaller image for grids; falls back to src. */
  thumb?: string;
  width: number;
  height: number;
  colours: ColourKey[];
  styles: Style[];
  subject: Subject | null;
  listedAt: string;
  liftUntil?: string;
  /** True for the sample listings in src/data/sample.ts. */
  sample?: boolean;
  /** Not yet published; only its artist can see it. */
  draft?: boolean;
};

export type Artist = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  medium: Medium;
  born: string;
  statement: string;
  joinedAt: string;
  works: Work[];
};

export type ListedWork = { artist: Artist; work: Work };

export function isLifted(work: Work, now = Date.now()): boolean {
  return !!work.liftUntil && new Date(work.liftUntil).getTime() > now;
}

export const workHref = (a: Pick<Artist, "slug">, w: Pick<Work, "slug">) => `/artworks/${a.slug}/${w.slug}`;
export const artistHref = (a: Pick<Artist, "slug">) => `/artists/${a.slug}`;
