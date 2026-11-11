import { defineConfig, devices } from "@playwright/test";

// The end-to-end stack runs on its own ports so it can run beside a normal
// `go run ./cmd/server` (5000) and `bun dev` (3000).
const API_PORT = 5100;
const APP_PORT = 3100;

const API_URL = `http://localhost:${API_PORT}`;
const APP_URL = `http://localhost:${APP_PORT}`;

// Relative to dwai-api/ (where it is built). Git-ignored.
const API_BINARY = "../dwai-e2e/.bin/e2eserver";

// Generous: the first run pulls the Postgres image and compiles the API.
const SERVER_STARTUP_TIMEOUT = 5 * 60 * 1000;

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  reporter: [["list"], ["html", { open: "never" }]],
  retries: process.env.CI ? 1 : 0,
  testDir: "./tests",
  use: {
    baseURL: APP_URL,
    trace: "on-first-retry",
  },
  webServer: [
    {
      // A throwaway Postgres container plus the API (see cmd/e2eserver).
      // Built first and exec'd, so the signal below reaches the server itself
      // (not `go run`, which leaves its child running), letting it remove the
      // container.
      command: `go build -tags e2e -o ${API_BINARY} ./cmd/e2eserver && exec ${API_BINARY}`,
      cwd: "../dwai-api",
      env: { E2E_ADDR: `localhost:${API_PORT}` },
      gracefulShutdown: { signal: "SIGTERM", timeout: 15 * 1000 },
      reuseExistingServer: false,
      timeout: SERVER_STARTUP_TIMEOUT,
      url: `${API_URL}/graphql?query=%7B__typename%7D`,
    },
    {
      // The app builds into its own directory (Next locks the default one),
      // so this can run beside a normal `bun dev`.
      command: `bun run dev --port ${APP_PORT}`,
      cwd: "../dwai-app",
      env: {
        NEXT_DIST_DIR: ".next-e2e",
        NEXT_PUBLIC_GRAPHQL_URI: API_URL,
      },
      reuseExistingServer: false,
      timeout: SERVER_STARTUP_TIMEOUT,
      url: APP_URL,
    },
  ],
});
