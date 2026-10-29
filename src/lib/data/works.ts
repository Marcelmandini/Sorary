import "server-only";
import { cache } from "react";
import { ARTISTS, allWorks as sampleWorks } from "@/data/sample";
import type { Artist, ListedWork, Work } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";
import type { ArtistRow } from "./artists";

export type WorkRow = {
  id: string;
  artist_id: string;
  slug: string;
  title: string;
  year: string;
  category: Work["category"];
  medium: string;
  dimensions: string;
  price: number | null;
  availability: Work["availability"];
  description: string;
  alt: string;
  styles: Work["styles"];
  subject: Work["subject"];
  colours: Work["colours"];
  image_path: string;
  thumb_path: string;
  width: number;
  height: number;
  published: boolean;
  lift_until: string | null;
  created_at: string;
  published_at: string | null;
};

export const WORK_COLUMNS =
  "id, artist_id, slug, title, year, category, medium, dimensions, price, availability, description, alt, styles, subject, colours, image_path, thumb_path, width, height, published, lift_until, created_at, published_at";

const ARTIST_COLUMNS = "id, slug, name, city, country, medium, born, statement, created_at";

/** Sample listings are for development only; production shows genuine listings only. */
export const showSampleWorks = () => process.env.SHOW_SAMPLE_WORKS === "true";

export function imageUrl(path: string): string {
  const env = supabaseEnv();
  return env ? `${env.url}/storage/v1/object/public/artworks/${path}` : "";
}

export function toWork(r: WorkRow): Work {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    year: r.year,
    medium: r.medium,
    category: r.category,
    dimensions: r.dimensions,
    price: r.price,
    currency: "SEK",
    availability: r.availability,
    description: r.description,
    alt: r.alt || [r.title, r.year, r.medium].filter(Boolean).join(", "),
    src: imageUrl(r.image_path),
    thumb: imageUrl(r.thumb_path),
    width: r.width,
    height: r.height,
    colours: r.colours,
    styles: r.styles,
    subject: r.subject,
    listedAt: r.published_at ?? r.created_at,
    liftUntil: r.lift_until ?? undefined,
    draft: !r.published,
  };
}

type ArtistLite = Pick<ArtistRow, "id" | "slug" | "name" | "city" | "country" | "medium" | "born" | "statement" | "created_at">;

export function toArtist(a: ArtistLite, works: Work[] = []): Artist {
  return {
    id: a.id,
    slug: a.slug,
    name: a.name,
    city: a.city,
    country: a.country,
    medium: a.medium,
    born: a.born ? String(a.born) : "",
    statement: a.statement,
    joinedAt: a.created_at,
    works,
  };
}

/** Every published work by a listed artist (RLS enforces both), newest first, plus samples in development. */
export const getCatalog = cache(async (): Promise<ListedWork[]> => {
  const supabase = await createClient();
  const out: ListedWork[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("works")
      .select(`${WORK_COLUMNS}, artist:artists!inner(${ARTIST_COLUMNS})`)
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(500);
    const artists = new Map<string, Artist>();
    for (const row of (data ?? []) as unknown as (WorkRow & { artist: ArtistLite })[]) {
      let artist = artists.get(row.artist.id);
      if (!artist) artists.set(row.artist.id, (artist = toArtist(row.artist)));
      const work = toWork(row);
      artist.works.push(work);
      out.push({ artist, work });
    }
  }
  if (showSampleWorks()) {
    const taken = new Set(out.map((x) => x.artist.slug));
    out.push(...sampleWorks().filter((x) => !taken.has(x.artist.slug)));
  }
  return out;
});

/** One work for its public page. Drafts are returned only to their artist (RLS). */
export const getWork = cache(async (artistSlug: string, workSlug: string): Promise<ListedWork | null> => {
  const supabase = await createClient();
  if (supabase) {
    const { data: a } = await supabase.from("artists").select(ARTIST_COLUMNS).eq("slug", artistSlug.toLowerCase()).maybeSingle();
    if (a) {
      const { data: rows } = await supabase
        .from("works")
        .select(WORK_COLUMNS)
        .eq("artist_id", a.id)
        .order("published_at", { ascending: false, nullsFirst: false });
      const works = ((rows ?? []) as WorkRow[]).map(toWork);
      const artist = toArtist(a as ArtistLite, works);
      const work = works.find((w) => w.slug === workSlug.toLowerCase());
      if (work) return { artist, work };
    }
  }
  if (showSampleWorks()) {
    const artist = ARTISTS.find((x) => x.slug === artistSlug);
    const work = artist?.works.find((w) => w.slug === workSlug);
    if (artist && work) return { artist, work };
  }
  return null;
});

/** Published works for an artist page (the owner also sees drafts through RLS, so filter here). */
export async function getPublishedWorksFor(artistId: string): Promise<WorkRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("works")
    .select(WORK_COLUMNS)
    .eq("artist_id", artistId)
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data ?? []) as WorkRow[];
}

/** The signed-in artist's own works, drafts included, for the studio. */
export async function getMyWorks(artistId: string): Promise<WorkRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from("works").select(WORK_COLUMNS).eq("artist_id", artistId).order("created_at", { ascending: false });
  return (data ?? []) as WorkRow[];
}
