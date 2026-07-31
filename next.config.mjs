import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this project (a stray lockfile exists higher up).
  outputFileTracingRoot: __dirname,
  images: {
    // Local assets only in Phase 1. Remote providers (e.g. Supabase storage)
    // can be added here later via remotePatterns.
    remotePatterns: [],
  },
};

export default nextConfig;
