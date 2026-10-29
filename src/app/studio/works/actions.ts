"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/artist-profile";
import { getMyArtist } from "@/lib/data/artists";
import { WORK_COLUMNS, type WorkRow } from "@/lib/data/works";
import { createClient } from "@/lib/supabase/server";
import { isColourKey, parseWork, titleFromFilename, type WorkErrors } from "@/lib/work-form";

export type WorkFormState = { status: "idle" | "saved" | "error"; errors?: WorkErrors; message?: string; work?: WorkRow };

const PATH_RE = /^[0-9a-f-]{36}\/[0-9a-f-]{36}-(full|thumb)\.(webp|jpg)$/;

function refresh(artistSlug: string) {
  revalidatePath("/studio/works");
  revalidatePath("/artworks");
  revalidatePath("/");
  revalidatePath(`/artists/${artistSlug}`);
}

async function uniqueSlug(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, artistId: string, title: string, exceptId?: string) {
  const base = slugify(title).slice(0, 70) || "work";
  const { data } = await supabase.from("works").select("id, slug").eq("artist_id", artistId).like("slug", `${base}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== exceptId).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

/** Records a freshly uploaded image as a draft work. The files are already in Storage under the artist's folder. */
export async function createDraftWork(input: {
  imagePath: string;
  thumbPath: string;
  width: number;
  height: number;
  colours: string[];
  filename: string;
}): Promise<{ ok: true; work: WorkRow } | { ok: false; message: string }> {
  const artist = await getMyArtist();
  if (!artist) return { ok: false, message: "Create your artist profile first." };
  const supabase = (await createClient())!;

  // Paths must be in this artist's folder and look like the uploader's names; the DB checks the folder too.
  const ok =
    PATH_RE.test(input.imagePath) &&
    PATH_RE.test(input.thumbPath) &&
    input.imagePath.startsWith(`${artist.id}/`) &&
    input.thumbPath.startsWith(`${artist.id}/`);
  if (!ok) return { ok: false, message: "Upload failed. Try again." };

  // Confirm both files really exist in Storage (the bucket itself enforces type and size).
  const folder = artist.id;
  const names = [input.imagePath, input.thumbPath].map((p) => p.slice(folder.length + 1));
  const { data: listed } = await supabase.storage.from("artworks").list(folder, { search: names[0].slice(0, 36) });
  const found = new Set((listed ?? []).map((f) => f.name));
  if (!names.every((n) => found.has(n))) return { ok: false, message: "Upload failed. Try again." };

  const width = Math.round(Number(input.width));
  const height = Math.round(Number(input.height));
  if (!(width > 0 && height > 0 && width <= 20000 && height <= 20000)) return { ok: false, message: "Upload failed. Try again." };

  const title = titleFromFilename(input.filename);
  const { data, error } = await supabase
    .from("works")
    .insert({
      artist_id: artist.id,
      slug: await uniqueSlug(supabase, artist.id, title),
      title,
      year: String(new Date().getFullYear()),
      category: artist.medium,
      image_path: input.imagePath,
      thumb_path: input.thumbPath,
      width,
      height,
      colours: input.colours.filter(isColourKey).slice(0, 3),
      published: false,
    })
    .select(WORK_COLUMNS)
    .single();
  if (error || !data) return { ok: false, message: "Could not save the work. Try again." };
  refresh(artist.slug);
  return { ok: true, work: data as WorkRow };
}

export async function updateWork(id: string, _prev: WorkFormState, form: FormData): Promise<WorkFormState> {
  const artist = await getMyArtist();
  if (!artist) return { status: "error", message: "Sign in again to save." };
  const parsed = parseWork(form);
  if (!parsed.ok) return { status: "error", errors: parsed.errors };
  const v = parsed.value;
  const supabase = (await createClient())!;

  const { data, error } = await supabase
    .from("works")
    .update({
      title: v.title,
      slug: await uniqueSlug(supabase, artist.id, v.title, id),
      year: v.year,
      category: v.category,
      medium: v.medium,
      dimensions: v.dimensions,
      price: v.price,
      availability: v.availability,
      description: v.description,
      alt: v.alt,
      styles: v.styles,
      subject: v.subject,
      published: v.published,
    })
    .eq("id", id)
    .eq("artist_id", artist.id)
    .select(WORK_COLUMNS)
    .maybeSingle();

  if (error || !data) return { status: "error", message: "Could not save your changes. Try again." };
  refresh(artist.slug);
  return { status: "saved", work: data as WorkRow };
}

export async function deleteWork(id: string): Promise<{ ok: boolean }> {
  const artist = await getMyArtist();
  if (!artist) return { ok: false };
  const supabase = (await createClient())!;
  const { data } = await supabase
    .from("works")
    .delete()
    .eq("id", id)
    .eq("artist_id", artist.id)
    .select("image_path, thumb_path")
    .maybeSingle();
  if (!data) return { ok: false };
  await supabase.storage.from("artworks").remove([data.image_path, data.thumb_path]);
  refresh(artist.slug);
  return { ok: true };
}
