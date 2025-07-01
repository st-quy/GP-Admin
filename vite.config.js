import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/",
  preview: {
    port: 8081,
    strictPort: true,
  },
  server: {
    port: 8081,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:8081",
  },
  resolve: {
    alias: {
      "@": path.resolve("./src"),
      "@app": path.resolve("./src/app"),
      "@features": path.resolve("./src/features"),
      "@shared": path.resolve("./src/shared"),
      "@pages": path.resolve("./src/pages"),
      "@assets": path.resolve("./src/assets"),
    },
  },
});
