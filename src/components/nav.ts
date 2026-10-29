export const MAIN_NAV = [
  { href: "/", label: "Discover" },
  { href: "/artworks", label: "Artworks" },
  { href: "/artists", label: "Artists" },
  { href: "/momentum", label: "Momentum" },
] as const;

export type Account = { signedIn: boolean; isArtist: boolean };

export function secondaryNav(account: Account) {
  return [
    { href: "/following", label: "Following" },
    account.isArtist ? { href: "/studio", label: "Studio" } : { href: "/sell", label: "For artists" },
  ];
}

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
