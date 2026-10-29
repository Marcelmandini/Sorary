import type { ColourKey } from "@/lib/taxonomy";

// Maps pixels to the 11 SORARY colour swatches. Used in the browser when an artist uploads a work;
// the result is stored on the artwork. Ported from the prototype so results match it.

export function colourName(r: number, g: number, b: number): ColourKey {
  r /= 255;
  g /= 255;
  b /= 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) {
    h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  if (l < 0.2) return "black";
  if (l > 0.8 && s < 0.45) return "white";
  if (s < 0.14) return l > 0.78 ? "white" : "grey";
  if (h >= 8 && h < 50 && (l < 0.4 || s < 0.3)) return "brown";
  if (h < 12 || h >= 345) return "red";
  if (h < 42) return "orange";
  if (h < 68) return "yellow";
  if (h < 180) return "green";
  if (h < 250) return "blue";
  if (h < 290) return "purple";
  return "pink";
}

/** Up to three colours that each cover at least 12% of the weighted pixels, most common first. */
export function topColours(weights: Partial<Record<ColourKey, number>>): ColourKey[] {
  const entries = Object.entries(weights) as [ColourKey, number][];
  const total = entries.reduce((a, [, v]) => a + v, 0) || 1;
  return entries
    .filter(([, v]) => v / total >= 0.12)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);
}

/** Colours of an RGBA pixel buffer (e.g. a 40×40 canvas). Neutrals count a little less so accents show. */
export function coloursOfPixels(data: Uint8ClampedArray): ColourKey[] {
  const weights: Partial<Record<ColourKey, number>> = {};
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const n = colourName(data[i], data[i + 1], data[i + 2]);
    weights[n] = (weights[n] ?? 0) + (n === "white" || n === "grey" ? 0.7 : 1);
  }
  return topColours(weights);
}
