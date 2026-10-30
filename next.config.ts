import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Project photos are served from Supabase Storage.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
