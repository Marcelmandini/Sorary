import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RESERVED_SLUGS, parseArtistProfile, slugProblem, slugify } from "./artist-profile";
import { safeNext } from "./safe-next";

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};

const base = { name: "Anna Lindberg", slug: "anna-lindberg", medium: "Painting" };

describe("slugify", () => {
  it("turns names into addresses", () => {
    expect(slugify("Marcel Mandini")).toBe("marcel-mandini");
    expect(slugify("Åsa Öberg-Ström")).toBe("asa-oberg-strom");
    expect(slugify("  --Studio  No. 5-- ")).toBe("studio-no-5");
    expect(slugify("x".repeat(60))).toHaveLength(40);
  });
});

describe("slugProblem", () => {
  it("accepts well-formed addresses", () => {
    expect(slugProblem("anna-lindberg")).toBe("");
    expect(slugProblem("a1b")).toBe("");
  });
  it("rejects bad shapes and reserved words", () => {
    expect(slugProblem("ab")).not.toBe("");
    expect(slugProblem("Anna")).not.toBe("");
    expect(slugProblem("anna--l")).not.toBe("");
    expect(slugProblem("-anna")).not.toBe("");
    expect(slugProblem("studio")).toBe("This address is taken.");
    expect(slugProblem("x".repeat(41))).not.toBe("");
  });
  it("matches the reserved list in the database migration", () => {
    const sql = readFileSync(path.join(process.cwd(), "supabase/migrations/0001_artists.sql"), "utf8");
    const block = sql.match(/is_reserved_slug[\s\S]*?array\[([\s\S]*?)\]/)![1];
    const inSql = new Set([...block.matchAll(/'([^']+)'/g)].map((m) => m[1]));
    expect([...inSql].sort()).toEqual([...RESERVED_SLUGS].sort());
  });
});

describe("parseArtistProfile", () => {
  it("accepts a minimal onboarding form and lists new profiles", () => {
    const r = parseArtistProfile(form(base), { onboarding: true });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toMatchObject({ name: "Anna Lindberg", slug: "anna-lindberg", medium: "Painting", born: null, listed: true });
    }
  });

  it("requires a name, a valid address and a known medium", () => {
    const r = parseArtistProfile(form({ name: " ", slug: "x", medium: "Video" }), { onboarding: true });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["medium", "name", "slug"]);
  });

  it("ignores the address when editing, so it cannot be changed", () => {
    const r = parseArtistProfile(form({ ...base, slug: "new-address", listed: "on" }), { onboarding: false });
    expect(r.ok && r.value.slug).toBe("");
  });

  it("reads the listed checkbox only when editing", () => {
    const off = parseArtistProfile(form(base), { onboarding: false });
    const on = parseArtistProfile(form({ ...base, listed: "on" }), { onboarding: false });
    expect(off.ok && off.value.listed).toBe(false);
    expect(on.ok && on.value.listed).toBe(true);
  });

  it("validates year of birth", () => {
    const next = String(new Date().getFullYear() + 1);
    for (const born of ["85", "1850", next, "19x5"]) {
      const r = parseArtistProfile(form({ ...base, born }), { onboarding: true });
      expect(r.ok, born).toBe(false);
    }
    const r = parseArtistProfile(form({ ...base, born: "2003" }), { onboarding: true });
    expect(r.ok && r.value.born).toBe(2003);
  });

  it("normalises website and Instagram", () => {
    const r = parseArtistProfile(form({ ...base, website: "yourstudio.com", instagram: "@your.studio" }), { onboarding: true });
    expect(r.ok && r.value.website).toBe("https://yourstudio.com");
    expect(r.ok && r.value.instagram).toBe("your.studio");
    const bad = parseArtistProfile(form({ ...base, website: "not a site", instagram: "has space" }), { onboarding: true });
    expect(!bad.ok && Object.keys(bad.errors).sort()).toEqual(["instagram", "website"]);
  });

  it("enforces length limits", () => {
    const r = parseArtistProfile(form({ ...base, statement: "x".repeat(181), bio: "x".repeat(3001) }), { onboarding: true });
    expect(!r.ok && Object.keys(r.errors).sort()).toEqual(["bio", "statement"]);
  });
});

describe("safeNext", () => {
  it("allows same-site paths only", () => {
    expect(safeNext("/studio/profile")).toBe("/studio/profile");
    expect(safeNext("https://evil.example")).toBe("/studio");
    expect(safeNext("//evil.example")).toBe("/studio");
    expect(safeNext("/\\evil.example")).toBe("/studio");
    expect(safeNext(null)).toBe("/studio");
  });
});
