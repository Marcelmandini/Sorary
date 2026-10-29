import { describe, expect, it } from "vitest";
import { FEES, artistReceives, buyerProtection, buyerTotal } from "./fees";

describe("fees", () => {
  it("matches the agreed business model", () => {
    expect(FEES.artistCommissionPct).toBe(0);
    expect(FEES.buyerProtectionPct).toBe(0.05);
    expect(FEES.buyerProtectionFixedSek).toBe(99);
    expect(FEES.liftPriceSek).toBe(49);
    expect(FEES.liftDays).toBe(7);
    expect(FEES.proPriceSekPerMonth).toBe(79);
  });

  it("buyer protection is 5% of the price plus 99 kr, rounded to whole kronor", () => {
    expect(buyerProtection(24000)).toBe(1299);
    expect(buyerProtection(12000)).toBe(699);
    expect(buyerProtection(6500)).toBe(424);
    expect(buyerProtection(1010)).toBe(150); // 50.5 + 99 = 149.5 → 150
  });

  it("buyer total is price plus buyer protection", () => {
    expect(buyerTotal(24000)).toBe(25299);
  });

  it("artists receive the full price", () => {
    expect(artistReceives(24000)).toBe(24000);
    expect(artistReceives(6500)).toBe(6500);
  });

  it("returns 0 for missing or invalid prices", () => {
    for (const p of [0, -100, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(buyerProtection(p)).toBe(0);
      expect(buyerTotal(p)).toBe(0);
      expect(artistReceives(p)).toBe(0);
    }
  });
});
