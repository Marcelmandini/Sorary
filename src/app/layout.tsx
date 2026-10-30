import type { Metadata, Viewport } from "next";
import { DM_Mono, Jost } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { SITE_URL } from "@/config/site";
import { SessionRefresher } from "@/components/SessionRefresher";
import { getCurrentUser, getMyArtist } from "@/lib/data/artists";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import "./globals.css";

const jost = Jost({ subsets: ["latin"], weight: ["200", "300", "400"], variable: "--font-jost", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["300", "400"], variable: "--font-dm-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "SORARY — Original contemporary art", template: "%s · SORARY" },
  description:
    "SORARY is a marketplace for original contemporary art. Artists sell for free and keep the full price. Collectors buy with buyer protection.",
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, artist] = await Promise.all([getCurrentUser(), getMyArtist()]);
  const account = { signedIn: !!user, isArtist: !!artist };

  return (
    <html lang="en" className={`${jost.variable} ${dmMono.variable}`}>
      <body className="min-h-dvh overflow-x-clip">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-90 focus:bg-fg focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Header logo={<Logo />} account={account} />
        <main id="main" className="wrap">
          {children}
        </main>
        <Footer />
        {isSupabaseConfigured() && <SessionRefresher />}
      </body>
    </html>
  );
}
