import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/mapillary/:path*',
        destination: 'https://mapillary-extensions.vercel.app/:path*',
      },
    ];
  },
};

export default nextConfig;
