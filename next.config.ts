import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Public API lives at /v1/*; route handlers sit under /api/v1/*.
  async rewrites() {
    return [{ source: "/v1/:path*", destination: "/api/v1/:path*" }];
  },
};

export default nextConfig;
