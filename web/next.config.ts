import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // This app is nested inside the NestJS backend repo, which has its own
  // package.json at the parent. Without an explicit root, Turbopack walks up,
  // infers the backend dir as the workspace root, and intermittently fails to
  // resolve the `next` package -> "Next.js package not found" panic. Pin it.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api-unionsahel.alfajarsoft.com" },
    ],
  },
};

export default nextConfig;
