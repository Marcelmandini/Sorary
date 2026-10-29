"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseArtistProfile, slugProblem, type FieldErrors } from "@/lib/artist-profile";
import { getCurrentUser } from "@/lib/data/artists";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = {
  status: "idle" | "saved" | "error";
  errors?: FieldErrors;
  message?: string;
  /** What was submitted, so fields keep their text after React resets the form on an error. */
  values?: Record<string, string>;
};

const submitted = (form: FormData) =>
  Object.fromEntries([...form.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$")) as [string, string][]);

// Postgres error codes returned by Supabase.
const UNIQUE_VIOLATION = "23505";

/** Is this profile address free? Used while typing during onboarding. */
export async function checkSlug(slug: string): Promise<{ ok: boolean; message: string }> {
  const problem = slugProblem(slug);
  if (problem) return { ok: false, message: problem };
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Sign-in is not configured yet." };
  const { data, error } = await supabase.rpc("slug_available", { candidate: slug });
  if (error) return { ok: false, message: "Could not check this address. Try again." };
  return data ? { ok: true, message: `Available · sorary.se/artists/${slug}` } : { ok: false, message: "This address is taken." };
}

export async function createArtistProfile(_prev: ProfileFormState, form: FormData): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/studio/onboarding");

  const parsed = parseArtistProfile(form, { onboarding: true });
  if (!parsed.ok) return { status: "error", errors: parsed.errors, values: submitted(form) };
  const v = parsed.value;

  const supabase = (await createClient())!;
  const { error } = await supabase.from("artists").insert({
    id: user.id,
    slug: v.slug,
    name: v.name,
    city: v.city,
    country: v.country,
    medium: v.medium,
    born: v.born,
    statement: v.statement,
    bio: v.bio,
    website: v.website,
    instagram: v.instagram,
  });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      // Either the address was taken in the meantime, or this account already has a profile.
      const { data: mine } = await supabase.from("artists").select("id").eq("id", user.id).maybeSingle();
      if (mine) redirect("/studio/profile");
      return { status: "error", errors: { slug: "This address is taken." }, values: submitted(form) };
    }
    return { status: "error", message: "Could not create your profile. Try again.", values: submitted(form) };
  }

  revalidatePath("/", "layout");
  redirect("/studio/profile?welcome=1");
}

export async function updateArtistProfile(_prev: ProfileFormState, form: FormData): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/studio/profile");

  const parsed = parseArtistProfile(form, { onboarding: false });
  if (!parsed.ok) return { status: "error", errors: parsed.errors, values: submitted(form) };
  const v = parsed.value;

  const supabase = (await createClient())!;
  const { data, error } = await supabase
    .from("artists")
    .update({
      name: v.name,
      city: v.city,
      country: v.country,
      medium: v.medium,
      born: v.born,
      statement: v.statement,
      bio: v.bio,
      website: v.website,
      instagram: v.instagram,
      listed: v.listed,
    })
    .eq("id", user.id)
    .select("slug")
    .maybeSingle();

  if (error || !data) return { status: "error", message: "Could not save your changes. Try again.", values: submitted(form) };
  revalidatePath("/", "layout");
  return { status: "saved", values: submitted(form) };
}
