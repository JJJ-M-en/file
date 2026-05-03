import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});

// ── Production deployment note ───────────────────────────────────────────────
// The Anthropic API is called directly from the browser using the
// "anthropic-dangerous-direct-browser-access" header.
//
// For production, create a backend proxy (Node/Express, Cloudflare Workers)
// that holds the API key server-side, then point aiService.js to it.
// See README.md → "Conexión a la red" for the full example.
