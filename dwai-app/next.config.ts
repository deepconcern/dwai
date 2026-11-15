import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Playwright tests run their own dev server beside any `bun dev` one,
  // so they build into a separate directory (Next locks the dist directory).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Memoizes components, values, and callbacks at build time, so the code
  // doesn't use useMemo or useCallback (see dwai-app/AGENTS.md).
  reactCompiler: true,
};

export default nextConfig;
