import type { NextConfig } from "next";

// Artwork images are served from Supabase Storage; allow next/image to optimise them.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/artworks/**" }]
      : [],
  },
};

export default nextConfig;
