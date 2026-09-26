import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@invitestory/contracts": path.resolve(__dirname, "../../packages/contracts/src"),
            "@invitestory/ingest": path.resolve(__dirname, "../../packages/ingest/src"),
            "@invitestory/extraction": path.resolve(__dirname, "../../packages/extraction/src"),
            "@invitestory/templates": path.resolve(__dirname, "../../packages/templates/src"),
            "@invitestory/compiler": path.resolve(__dirname, "../../packages/compiler/src"),
            "@invitestory/sandbox": path.resolve(__dirname, "../../packages/sandbox/src"),
            "@invitestory/browser-qa": path.resolve(__dirname, "../../packages/browser-qa/src"),
            "@invitestory/visual-qa": path.resolve(__dirname, "../../packages/visual-qa/src"),
            "@invitestory/model-router": path.resolve(__dirname, "../../packages/model-router/src")
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
//# sourceMappingURL=vite.config.js.map