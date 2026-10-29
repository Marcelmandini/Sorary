import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Medium } from "@/lib/taxonomy";

export type ArtistRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  medium: Medium;
  born: number | null;
  statement: string;
  bio: string;
  website: string;
  instagram: string;
  listed: boolean;
  created_at: string;
  updated_at: string;
};

const COLUMNS = "id, slug, name, city, country, medium, born, statement, bio, website, instagram, listed, created_at, updated_at";

/** The signed-in user, verified with Supabase Auth. Null when signed out or not configured. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub as string, email: (data.claims.email as string | undefined) ?? "" };
});

/** The signed-in user's artist profile, if they have created one. */
export const getMyArtist = cache(async (): Promise<ArtistRow | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase!.from("artists").select(COLUMNS).eq("id", user.id).maybeSingle();
  return (data as ArtistRow | null) ?? null;
});

/** Most recently joined listed artists, for the home page. */
export const getNewArtists = cache(async (limit = 5): Promise<ArtistRow[]> => {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase.from("artists").select(COLUMNS).eq("listed", true).order("created_at", { ascending: false }).limit(limit);
  return (data as ArtistRow[] | null) ?? [];
});

/** A public artist profile. RLS returns unlisted profiles only to their owner. */
export const getArtistBySlug = cache(async (slug: string): Promise<ArtistRow | null> => {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.from("artists").select(COLUMNS).eq("slug", slug.toLowerCase()).maybeSingle();
  return (data as ArtistRow | null) ?? null;
});
