import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@ftechnology/shared": resolve(__dirname, "../../libs/shared/src"),
      "@ftechnology/ui": resolve(__dirname, "../../libs/ui/src"),
    },
  },
  server: {
    port: 4200,
    host: true,
    allowedHosts: ['localhost', 'host.docker.internal'],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "../../dist/apps/frontend",
    emptyOutDir: true,
    sourcemap: true,
  },
});
