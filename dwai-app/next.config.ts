import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Playwright tests run their own dev server beside any `bun dev` one,
  // so they build into a separate directory (Next locks the dist directory).
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
