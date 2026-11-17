import type { NextConfig } from "next";

import { apiUri } from "./lib/apiUri";

const nextConfig: NextConfig = {
  // The Playwright tests run their own dev server beside any `bun dev` one,
  // so they build into a separate directory (Next locks the dist directory).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Memoizes components, values, and callbacks at build time, so the code
  // doesn't use useMemo or useCallback (see dwai-app/AGENTS.md).
  reactCompiler: true,
  // The browser calls the API through the app's own origin, so the session
  // cookie is first-party (HttpOnly, SameSite=Lax) and no CORS is needed.
  rewrites: async () => [
    { destination: new URL("/graphql", apiUri).toString(), source: "/graphql" },
  ],
};

export default nextConfig;
