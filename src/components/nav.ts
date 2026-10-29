export const MAIN_NAV = [
  { href: "/", label: "Discover" },
  { href: "/artworks", label: "Artworks" },
  { href: "/artists", label: "Artists" },
  { href: "/momentum", label: "Momentum" },
] as const;

export const SECONDARY_NAV = [
  { href: "/following", label: "Following" },
  { href: "/sell", label: "For artists" },
] as const;

export const FOOTER_NAV = [
  { href: "/artworks", label: "Artworks" },
  { href: "/artists", label: "Artists" },
  { href: "/momentum", label: "Artist Momentum" },
  { href: "/sell", label: "Sell on SORARY" },
  { href: "/buyer-protection", label: "Buyer protection" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}
