import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore - Next.js types sometimes throw a false positive for this property
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
