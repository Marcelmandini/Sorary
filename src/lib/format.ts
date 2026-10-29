const sekNumber = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });

/** Whole number with Swedish grouping, e.g. 24 000 (non-breaking spaces). */
export function formatNumber(n: number): string {
  // Intl uses U+00A0 for sv-SE grouping on most engines and U+202F on some; normalise to U+00A0.
  return sekNumber.format(Math.round(n || 0)).replace(/ /g, " ");
}

/** Price in Swedish style: SEK 24 000. Empty string for missing prices. */
export function formatPrice(n: number | null | undefined, currency = "SEK"): string {
  if (!n) return "";
  return `${currency} ${formatNumber(n)}`;
}
