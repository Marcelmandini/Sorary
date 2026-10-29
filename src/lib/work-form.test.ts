import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { colourName, coloursOfPixels, topColours } from "./colours";
import { parsePrice, parseWork, titleFromFilename } from "./work-form";

const form = (fields: Record<string, string | string[]>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) for (const x of [v].flat()) f.append(k, x);
  return f;
};
const base = { title: "Fenix", year: "2025", category: "Painting", availability: "available" };

describe("parsePrice", () => {
  it("reads Swedish-style prices", () => {
    expect(parsePrice("12 500")).toBe(12500);
    expect(parsePrice("SEK 12 500")).toBe(12500);
    expect(parsePrice("8000 kr")).toBe(8000);
    expect(parsePrice("")).toBeNull();
    expect(parsePrice("12,5")).toBeNaN();
  });
});

describe("parseWork", () => {
  it("accepts a draft without a price", () => {
    const r = parseWork(form(base));
    expect(r.ok && r.value).toMatchObject({ title: "Fenix", price: null, published: false, styles: [], subject: null });
  });

  it("requires a price to publish a work that is for sale", () => {
    const r = parseWork(form({ ...base, published: "on" }));
    expect(!r.ok && r.errors.price).toMatch(/price/i);
    expect(parseWork(form({ ...base, published: "on", price: "12 000" })).ok).toBe(true);
    expect(parseWork(form({ ...base, published: "on", availability: "sold" })).ok).toBe(true);
  });

  it("keeps only known styles and subjects", () => {
    const r = parseWork(form({ ...base, styles: ["Abstract", "Cubist"], subject: "Nature" }));
    expect(r.ok && r.value.styles).toEqual(["Abstract"]);
    expect(parseWork(form({ ...base, subject: "Space" })).ok).toBe(false);
  });

  it("rejects bad prices and missing titles", () => {
    const r = parseWork(form({ ...base, title: "", price: "abc" }));
    expect(!r.ok && Object.keys(r.errors).sort()).toEqual(["price", "title"]);
    expect(parseWork(form({ ...base, price: "0" })).ok).toBe(false);
  });
});

describe("titleFromFilename", () => {
  it("makes a readable title", () => {
    expect(titleFromFilename("untitled_scan-03.JPG")).toBe("Untitled scan 03");
    expect(titleFromFilename(".png")).toBe("Untitled");
  });
});

describe("colours", () => {
  it("names basic colours", () => {
    expect(colourName(179, 50, 42)).toBe("red");
    expect(colourName(62, 106, 158)).toBe("blue");
    expect(colourName(10, 10, 10)).toBe("black");
    expect(colourName(245, 244, 240)).toBe("white");
    expect(colourName(150, 150, 150)).toBe("grey");
    expect(colourName(122, 78, 45)).toBe("brown");
  });

  it("keeps up to three colours above 12%", () => {
    expect(topColours({ red: 50, blue: 30, green: 15, pink: 5 })).toEqual(["red", "blue", "green"]);
  });

  it("reads a pixel buffer", () => {
    const px = new Uint8ClampedArray(4 * 10);
    for (let i = 0; i < 10; i++) px.set(i < 7 ? [62, 106, 158, 255] : [179, 50, 42, 255], i * 4);
    expect(coloursOfPixels(px)).toEqual(["blue", "red"]);
  });

  it("matches the colours and subjects allowed in the database", () => {
    const sql = readFileSync(path.join(process.cwd(), "supabase/migrations/0003_works.sql"), "utf8");
    for (const k of ["red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "black", "grey", "white"]) {
      expect(sql).toContain(`'${k}'`);
    }
    expect(sql).toContain("'Landscape & sea'");
  });
});
