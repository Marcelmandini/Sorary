import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Artwork files are already web-sized WebP; uploads will be resized on the server in phase 3.
  images: { formats: ["image/webp"] },
};

export default nextConfig;
