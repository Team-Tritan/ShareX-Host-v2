import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:8080/api/:path*",
      },
      {
        source: "/u/:path",
        destination: "http://backend:8080/u/:path",
      }
    ];
  }
};

export default nextConfig;
