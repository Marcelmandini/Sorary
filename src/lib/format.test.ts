import { describe, expect, it } from "vitest";
import { formatNumber, formatPrice } from "./format";

const NBSP = " ";

describe("format", () => {
  it("formats SEK Swedish style", () => {
    expect(formatPrice(24000)).toBe(`SEK${NBSP}24${NBSP}000`);
    expect(formatPrice(1250000)).toBe(`SEK${NBSP}1${NBSP}250${NBSP}000`);
    expect(formatPrice(950)).toBe(`SEK${NBSP}950`);
  });

  it("rounds to whole kronor", () => {
    expect(formatNumber(1299.6)).toBe(`1${NBSP}300`);
  });

  it("returns an empty string for a missing price", () => {
    expect(formatPrice(0)).toBe("");
    expect(formatPrice(null)).toBe("");
  });
});
