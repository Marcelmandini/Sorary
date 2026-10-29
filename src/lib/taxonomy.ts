export const MEDIUMS = ["Painting", "Sculpture", "Photography", "Works on paper"] as const;
export type Medium = (typeof MEDIUMS)[number];

export const STYLES = ["Abstract", "Figurative", "Expressive", "Minimalist"] as const;
export type Style = (typeof STYLES)[number];

export const SUBJECTS = [
  "Landscape & sea",
  "Figures & faces",
  "Nature",
  "Architecture",
  "Form & object",
  "Non-figurative",
] as const;
export type Subject = (typeof SUBJECTS)[number];

/** The 11 colour swatches. Detected from the image on upload (phase 3) and stored on the artwork. */
export const COLOURS = [
  { key: "red", label: "Red", hex: "#B3322A" },
  { key: "orange", label: "Orange", hex: "#D9792E" },
  { key: "yellow", label: "Yellow", hex: "#E2B93B" },
  { key: "green", label: "Green", hex: "#4F7A3F" },
  { key: "blue", label: "Blue", hex: "#3E6A9E" },
  { key: "purple", label: "Purple", hex: "#6E4A8E" },
  { key: "pink", label: "Pink", hex: "#D9668F" },
  { key: "brown", label: "Brown", hex: "#7A4E2D" },
  { key: "black", label: "Black", hex: "#161616" },
  { key: "grey", label: "Grey", hex: "#9A9A9A" },
  { key: "white", label: "White", hex: "#F3F1EC" },
] as const;
export type ColourKey = (typeof COLOURS)[number]["key"];

export const AVAILABILITY = { available: "Available", reserved: "Reserved", sold: "Sold" } as const;
export type Availability = keyof typeof AVAILABILITY;

export const PRICE_BANDS = [
  { key: "any", label: "Any price", min: 0, max: Infinity },
  { key: "u15", label: "Under SEK 15 000", min: 0, max: 15000 },
  { key: "m", label: "SEK 15 000–40 000", min: 15000, max: 40000 },
  { key: "o40", label: "Over SEK 40 000", min: 40000, max: Infinity },
] as const;
export type PriceBandKey = (typeof PRICE_BANDS)[number]["key"];
