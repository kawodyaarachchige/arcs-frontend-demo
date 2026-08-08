import type { NextConfig } from "next";

const gatewayOrigin =
  process.env.GATEWAY_ORIGIN?.replace(/\/$/, "") || "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${gatewayOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
