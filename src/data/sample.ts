// Sample listings from reference/prototype.html: real works by Marcel Mandini, not stored in the database.
// Shown only when SHOW_SAMPLE_WORKS=true (development). They cannot be bought, and no activity figures
// are invented for them.

import type { Artist, ListedWork } from "@/lib/catalog";

export type { Artist, ListedWork, Work } from "@/lib/catalog";
export { artistHref, isLifted, workHref } from "@/lib/catalog";

const marcel: Artist = {
  id: "marcel-mandini",
  slug: "marcel-mandini",
  name: "Marcel Mandini",
  city: "Stockholm",
  country: "Sweden",
  medium: "Painting",
  born: "2003",
  statement:
    "Expressive acrylic paintings where scribbled figures, signs and words surface through layered fields of colour.",
  joinedAt: "2026-10-28",
  works: [
    {
      id: "mm390842", slug: "fenix", title: "Fenix", year: "2025", medium: "Acrylic", category: "Painting",
      dimensions: "", price: 12000, currency: "SEK", availability: "available",
      description: "Silver-grey field over a dark horizon band, with figures and signs scratched into the surface.",
      alt: "Fenix, 2025, acrylic painting in grey and blue tones",
      src: "/art/sorary-390842.webp", width: 572, height: 702,
      colours: ["blue", "grey"], styles: ["Abstract"], subject: "Non-figurative", listedAt: "2026-10-28T10:00:00Z",
    },
    {
      id: "mm390839", slug: "flora-flora", title: "Flora Flora", year: "2026", medium: "Acrylic", category: "Painting",
      dimensions: "", price: 11500, currency: "SEK", availability: "available",
      description: "A misty green field with small drawn figures above a dark band of water-like colour.",
      alt: "Flora Flora, 2026, acrylic painting in muted greens",
      src: "/art/sorary-390839.webp", width: 519, height: 586,
      colours: ["grey", "green"], styles: ["Abstract", "Expressive"], subject: "Nature", listedAt: "2026-10-28T09:50:00Z",
    },
    {
      id: "mm390836", slug: "purple-rain", title: "Purple Rain", year: "2026", medium: "Acrylic", category: "Painting",
      dimensions: "", price: 11500, currency: "SEK", availability: "available",
      description: "Magenta and violet layers with drawn marks, resting on a deep purple horizon band.",
      alt: "Purple Rain, 2026, acrylic painting in magenta and violet",
      src: "/art/sorary-390836.webp", width: 554, height: 721,
      colours: ["pink", "black"], styles: ["Abstract", "Expressive"], subject: "Non-figurative", listedAt: "2026-10-28T09:40:00Z",
    },
    {
      id: "mm390835", slug: "gloria", title: "Gloria", year: "2026", medium: "Acrylic", category: "Painting",
      dimensions: "", price: 11500, currency: "SEK", availability: "available",
      description: "A glowing amber centre opening out of burnt orange, above a dark brown band.",
      alt: "Gloria, 2026, acrylic painting in amber and burnt orange",
      src: "/art/sorary-390835.webp", width: 610, height: 769,
      colours: ["brown", "black", "orange"], styles: ["Abstract"], subject: "Non-figurative", listedAt: "2026-10-28T09:30:00Z",
    },
    {
      id: "mm390834", slug: "renatus", title: "Renatus", year: "2026", medium: "Acrylic", category: "Painting",
      dimensions: "", price: 12500, currency: "SEK", availability: "available",
      description: "Acid green light breaking through a dark field, with drawn figures above a deep horizon.",
      alt: "Renatus, 2026, acrylic painting in acid green and black",
      src: "/art/sorary-390834.webp", width: 568, height: 685,
      colours: ["grey", "green", "black"], styles: ["Abstract", "Expressive"], subject: "Nature", listedAt: "2026-10-28T09:20:00Z",
    },
    {
      id: "mm315587", slug: "friki-olivia", title: "Friki Olivia", year: "2024", medium: "Acrylic", category: "Painting",
      dimensions: "120 × 160 cm", price: 16000, currency: "SEK", availability: "available",
      description: "A large pale blue canvas filled with drawn creatures, words and bursts of colour.",
      alt: "Friki Olivia, 2024, large acrylic painting in pale blue with drawn figures",
      src: "/art/sorary-315587.webp", width: 367, height: 499,
      colours: ["blue"], styles: ["Expressive", "Figurative"], subject: "Figures & faces", listedAt: "2026-10-28T09:10:00Z",
    },
    {
      id: "mm284611", slug: "rosso-amore-ardente", title: "Rosso Amore Ardente", year: "2023", medium: "Acrylic", category: "Painting",
      dimensions: "60 × 80 × 5 cm", price: 6500, currency: "SEK", availability: "available",
      description: "Deep red and black, worked in vertical drips. From the series Non Title.",
      alt: "Rosso Amore Ardente, 2023, acrylic painting in deep red",
      src: "/art/sorary-284611.webp", width: 425, height: 628,
      colours: ["black", "red"], styles: ["Abstract", "Expressive"], subject: "Non-figurative", listedAt: "2026-10-28T09:00:00Z",
    },
    {
      id: "mm284610", slug: "mistero-simbolico", title: "Mistero Simbolico", year: "2023", medium: "Acrylic", category: "Painting",
      dimensions: "60 × 80 × 5 cm", price: 7500, currency: "SEK", availability: "available",
      description: "A textured gold surface covered in drawn faces, symbols and words. From the series Brutta Arte.",
      alt: "Mistero Simbolico, 2023, textured gold acrylic painting with drawn faces",
      src: "/art/sorary-284610.webp", width: 495, height: 693,
      colours: ["orange", "brown"], styles: ["Expressive", "Figurative"], subject: "Figures & faces", listedAt: "2026-10-28T08:50:00Z",
    },
    {
      id: "mm284606", slug: "flora-flora-brutta-arte", title: "Flora Flora (Brutta Arte)", year: "2023", medium: "Acrylic", category: "Painting",
      dimensions: "60 × 80 × 5 cm", price: 6500, currency: "SEK", availability: "available",
      description: "White chalk-like drawings of figures and objects on deep green. From the series Brutta Arte.",
      alt: "Flora Flora, 2023, acrylic painting with white drawings on deep green",
      src: "/art/sorary-284606.webp", width: 316, height: 403,
      colours: ["black", "green", "blue"], styles: ["Expressive", "Figurative"], subject: "Figures & faces", listedAt: "2026-10-28T08:40:00Z",
    },
    {
      id: "mm284603", slug: "teresa", title: "Teresa", year: "2023", medium: "Acrylic", category: "Painting",
      dimensions: "80 × 110 × 5 cm", price: 9500, currency: "SEK", availability: "available",
      description: "Hot pink and red layers with flashes of turquoise. From the series Brutta Arte.",
      alt: "Teresa, 2023, acrylic painting in pink, red and turquoise",
      src: "/art/sorary-284603.webp", width: 272, height: 335,
      colours: ["red", "pink"], styles: ["Abstract", "Expressive"], subject: "Non-figurative", listedAt: "2026-10-28T08:30:00Z",
    },
    {
      id: "mm271461", slug: "bel-alma", title: "Bel Alma", year: "2024", medium: "Acrylic", category: "Painting",
      dimensions: "60 × 80 × 5 cm", price: 6500, currency: "SEK", availability: "available",
      description: "Earth browns and acid greens with scratched words and signs. From the series Brutta Arte.",
      alt: "Bel Alma, 2024, acrylic painting in brown and green with scratched text",
      src: "/art/sorary-271461.webp", width: 451, height: 602,
      colours: ["orange", "brown"], styles: ["Expressive"], subject: "Figures & faces", listedAt: "2026-10-28T08:20:00Z",
    },
  ],
};

marcel.works.forEach((w) => (w.sample = true));

export const ARTISTS: Artist[] = [marcel];

export function allWorks(): ListedWork[] {
  return ARTISTS.flatMap((artist) => artist.works.map((work) => ({ artist, work })));
}
