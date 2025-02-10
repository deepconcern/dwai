import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    jsxImportSource: "@emotion/react",
  })],
  server: {
    proxy: {
      "/graphql": "http://localhost:5000",
    },
  },
});
