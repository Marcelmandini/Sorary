import { MEDIUMS, STYLES, SUBJECTS, AVAILABILITY, COLOURS, type Availability, type ColourKey, type Medium, type Style, type Subject } from "@/lib/taxonomy";

// Validation for an artwork listing, shared by the studio form and the server action.
// The database repeats these rules (supabase/migrations/0003_works.sql).

export const WORK_LIMITS = { title: 120, year: 12, medium: 120, dimensions: 60, description: 800, alt: 200 } as const;
export const PRICE_MAX = 100_000_000;

/** Original files accepted from the artist, before resizing in the browser. */
export const UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const UPLOAD_MAX_BYTES = 25 * 1024 * 1024;
/** Longest side of the stored images. */
export const FULL_MAX_PX = 2400;
export const THUMB_MAX_PX = 900;

export type WorkInput = {
  title: string;
  year: string;
  category: Medium;
  medium: string;
  dimensions: string;
  price: number | null;
  availability: Availability;
  description: string;
  alt: string;
  styles: Style[];
  subject: Subject | null;
  published: boolean;
};

export type WorkErrors = Partial<Record<keyof WorkInput, string>>;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

/** "12 500", "12500 kr", "SEK 12 500" → 12500. Empty → null. Anything else → NaN. */
export function parsePrice(raw: string): number | null {
  const cleaned = raw.replace(/sek|kr|[\s  ]/gi, "");
  if (!cleaned) return null;
  if (!/^\d+$/.test(cleaned)) return Number.NaN;
  return Number(cleaned);
}

export function parseWork(form: FormData): { ok: true; value: WorkInput } | { ok: false; errors: WorkErrors } {
  const errors: WorkErrors = {};
  const title = str(form.get("title"));
  const year = str(form.get("year"));
  const category = str(form.get("category")) as Medium;
  const medium = str(form.get("medium"));
  const dimensions = str(form.get("dimensions"));
  const price = parsePrice(str(form.get("price")));
  const availability = (str(form.get("availability")) || "available") as Availability;
  const description = str(form.get("description")).replace(/\r\n/g, "\n");
  const alt = str(form.get("alt"));
  const styles = form.getAll("styles").map(String).filter((s): s is Style => (STYLES as readonly string[]).includes(s));
  const subjectRaw = str(form.get("subject"));
  const published = form.get("published") === "on";

  if (!title) errors.title = "Add a title.";
  else if (title.length > WORK_LIMITS.title) errors.title = `Use at most ${WORK_LIMITS.title} characters.`;
  if (year.length > WORK_LIMITS.year) errors.year = `Use at most ${WORK_LIMITS.year} characters.`;
  if (!MEDIUMS.includes(category)) errors.category = "Choose a category.";
  if (medium.length > WORK_LIMITS.medium) errors.medium = `Use at most ${WORK_LIMITS.medium} characters.`;
  if (dimensions.length > WORK_LIMITS.dimensions) errors.dimensions = `Use at most ${WORK_LIMITS.dimensions} characters.`;
  if (price !== null && (Number.isNaN(price) || price < 1 || price > PRICE_MAX)) errors.price = "Enter the price in whole kronor, for example 12 500.";
  if (!(availability in AVAILABILITY)) errors.availability = "Choose availability.";
  if (description.length > WORK_LIMITS.description) errors.description = `Use at most ${WORK_LIMITS.description} characters.`;
  if (alt.length > WORK_LIMITS.alt) errors.alt = `Use at most ${WORK_LIMITS.alt} characters.`;
  if (subjectRaw && !(SUBJECTS as readonly string[]).includes(subjectRaw)) errors.subject = "Choose a subject.";
  if (published && availability === "available" && price === null && !errors.price) {
    errors.price = "Add a price before publishing a work that is for sale.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      title, year, category, medium, dimensions, price: price as number | null, availability, description, alt, styles,
      subject: (subjectRaw || null) as Subject | null, published,
    },
  };
}

export function isColourKey(v: string): v is ColourKey {
  return COLOURS.some((c) => c.key === v);
}

/** "Untitled_scan-03.JPG" → "Untitled scan 03" */
export function titleFromFilename(name: string): string {
  const t = name.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, WORK_LIMITS.title);
  return t ? t[0].toUpperCase() + t.slice(1) : "Untitled";
}
