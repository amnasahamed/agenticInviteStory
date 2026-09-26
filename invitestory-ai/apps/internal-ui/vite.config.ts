import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import alias from "@rollup/plugin-alias";

const libAliases = [
  { find: "lib/contracts", replacement: path.resolve(__dirname, "src/lib/contracts") },
  { find: "lib/templates", replacement: path.resolve(__dirname, "src/lib/templates") },
  { find: "lib/ingest", replacement: path.resolve(__dirname, "src/lib/ingest") },
  { find: "lib/extraction", replacement: path.resolve(__dirname, "src/lib/extraction") },
  { find: "lib/compiler", replacement: path.resolve(__dirname, "src/lib/compiler") },
  { find: "lib/sandbox", replacement: path.resolve(__dirname, "src/lib/sandbox") },
  { find: "lib/browser-qa", replacement: path.resolve(__dirname, "src/lib/browser-qa") },
  { find: "lib/visual-qa", replacement: path.resolve(__dirname, "src/lib/visual-qa") },
  { find: "lib/model-router", replacement: path.resolve(__dirname, "src/lib/model-router") },
];

export default defineConfig({
  plugins: [
    react(),
    alias({ entries: libAliases })
  ],
  resolve: {
    alias: Object.fromEntries(libAliases.map(a => [a.find, a.replacement]))
  },
  build: {
    rollupOptions: {
      plugins: [alias({ entries: libAliases })]
    }
  },
  server: {
    port: 3000,
    proxy: {
      "/v1": {
        target: "http://localhost:8787",
        changeOrigin: true
      }
    }
  }
});