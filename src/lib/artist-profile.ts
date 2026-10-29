import { MEDIUMS, type Medium } from "@/lib/taxonomy";

// Validation for the artist profile, shared by onboarding and the studio profile form.
// The database enforces the same rules (supabase/migrations), so a bypassed form still fails safely.

export const SLUG_MIN = 3;
export const SLUG_MAX = 40;
export const LIMITS = { name: 80, city: 60, country: 60, statement: 180, bio: 3000, website: 200, instagram: 60 } as const;

/** Addresses that collide with app routes or could be mistaken for SORARY itself. Mirrored in SQL. */
export const RESERVED_SLUGS = new Set(
  (
    "about admin api app art artists artworks assets auth blog buyer-protection checkout contact cookies dashboard " +
    "demo downloads following help home legal login logout momentum new onboarding orders preview pricing privacy " +
    "profile sell settings signup sorary static studio support terms www"
  ).split(" "),
);

export type ArtistProfileInput = {
  name: string;
  slug: string;
  city: string;
  country: string;
  medium: Medium;
  born: number | null;
  statement: string;
  bio: string;
  website: string;
  instagram: string;
  listed: boolean;
};

export type FieldErrors = Partial<Record<keyof ArtistProfileInput, string>>;

export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

/** Returns an error message, or "" when the slug is well-formed. Does not check whether it is taken. */
export function slugProblem(slug: string): string {
  if (slug.length < SLUG_MIN) return `Use at least ${SLUG_MIN} characters.`;
  if (slug.length > SLUG_MAX) return `Use at most ${SLUG_MAX} characters.`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "Use lowercase letters, numbers and single hyphens.";
  if (RESERVED_SLUGS.has(slug)) return "This address is taken.";
  return "";
}

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

function normaliseWebsite(v: string): string {
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/**
 * Parses and validates a profile form. Onboarding sends the slug and no "listed" checkbox (new profiles
 * are listed); the studio profile form sends the checkbox and never the slug, which cannot change.
 */
export function parseArtistProfile(
  form: FormData,
  { onboarding }: { onboarding: boolean },
): { ok: true; value: ArtistProfileInput } | { ok: false; errors: FieldErrors } {
  const withSlug = onboarding;
  const errors: FieldErrors = {};
  const name = str(form.get("name"));
  const slug = withSlug ? str(form.get("slug")).toLowerCase() : "";
  const city = str(form.get("city"));
  const country = str(form.get("country"));
  const medium = str(form.get("medium")) as Medium;
  const bornRaw = str(form.get("born"));
  const statement = str(form.get("statement"));
  const bio = str(form.get("bio")).replace(/\r\n/g, "\n");
  const website = normaliseWebsite(str(form.get("website")));
  const instagram = str(form.get("instagram")).replace(/^@+/, "");
  // An unticked checkbox is simply absent from the form data.
  const listed = onboarding ? true : form.get("listed") === "on";

  if (!name) errors.name = "Add the name you work under.";
  else if (name.length > LIMITS.name) errors.name = `Use at most ${LIMITS.name} characters.`;

  if (withSlug) {
    const p = slugProblem(slug);
    if (p) errors.slug = p;
  }

  if (city.length > LIMITS.city) errors.city = `Use at most ${LIMITS.city} characters.`;
  if (country.length > LIMITS.country) errors.country = `Use at most ${LIMITS.country} characters.`;
  if (!MEDIUMS.includes(medium)) errors.medium = "Choose a medium.";

  let born: number | null = null;
  if (bornRaw) {
    const year = Number(bornRaw);
    const now = new Date().getFullYear();
    if (!/^\d{4}$/.test(bornRaw) || year < 1900 || year > now) errors.born = "Use a four-digit year, or leave it empty.";
    else born = year;
  }

  if (statement.length > LIMITS.statement) errors.statement = `Use at most ${LIMITS.statement} characters.`;
  if (bio.length > LIMITS.bio) errors.bio = `Use at most ${LIMITS.bio} characters.`;

  if (website) {
    if (website.length > LIMITS.website) errors.website = `Use at most ${LIMITS.website} characters.`;
    else {
      try {
        const u = new URL(website);
        if (!u.hostname.includes(".")) throw new Error();
      } catch {
        errors.website = "Enter a web address, for example yourstudio.com.";
      }
    }
  }
  if (instagram && !/^[A-Za-z0-9._]{1,30}$/.test(instagram)) errors.instagram = "Enter your Instagram username.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, slug, city, country, medium, born, statement, bio, website, instagram, listed } };
}
