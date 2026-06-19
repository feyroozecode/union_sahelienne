import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // This app is nested inside the NestJS backend repo (which has its own
  // package.json at the parent). Without an explicit root, Turbopack walks up,
  // infers the backend dir as the workspace root, and fails to resolve the
  // `next` package -> "Next.js package not found" panic. Pin it to this dir.
  turbopack: {
    root: rootDir,
  },
  allowedDevOrigins: ['192.168.1.184'],
};

export default nextConfig;
