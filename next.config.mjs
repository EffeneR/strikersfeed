/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Local assets only in Phase 1. Remote providers (e.g. Supabase storage)
    // can be added here later via remotePatterns.
    remotePatterns: [],
  },
};

export default nextConfig;
