import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev-only on-screen indicator (it overlapped the sidebar's user
  // area). Compile/runtime errors are still surfaced by Next.js.
  devIndicators: false,
};

export default nextConfig;
