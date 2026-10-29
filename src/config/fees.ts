// The single source of truth for every fee on SORARY. Components never hardcode these.
// Changing any value here is a business decision: ask before editing.

export const FEES = {
  /** Commission taken from artists. Artists receive the full price. */
  artistCommissionPct: 0,
  /** Buyer protection: a share of the price plus a fixed amount, paid by the buyer on top. */
  buyerProtectionPct: 0.05,
  buyerProtectionFixedSek: 99,
  /** Lift: optional paid placement, always labelled "Sponsored", never affects Momentum. */
  liftPriceSek: 49,
  liftDays: 7,
  /** Pro: optional subscription with extra analytics (built later). */
  proPriceSekPerMonth: 79,
  /** Days after confirmed delivery before funds are released to the artist. */
  payoutReleaseDays: 2,
} as const;

/** Buyer protection in whole kronor for a given price. */
export function buyerProtection(priceSek: number): number {
  if (!Number.isFinite(priceSek) || priceSek <= 0) return 0;
  return Math.round(priceSek * FEES.buyerProtectionPct + FEES.buyerProtectionFixedSek);
}

/** What the buyer pays before shipping: price + buyer protection. */
export function buyerTotal(priceSek: number): number {
  if (!Number.isFinite(priceSek) || priceSek <= 0) return 0;
  return priceSek + buyerProtection(priceSek);
}

/** What the artist receives for a sale. */
export function artistReceives(priceSek: number): number {
  if (!Number.isFinite(priceSek) || priceSek <= 0) return 0;
  return Math.round(priceSek * (1 - FEES.artistCommissionPct));
}
