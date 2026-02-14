import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // Arquivos estáticos: coloque favicon, produtos, banner e criativos em src/public/
  publicDir: "src/public",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.VITE_API_PORT ?? 3000}`,
        changeOrigin: true,
      },
      "/health": {
        target: `http://localhost:${process.env.VITE_API_PORT ?? 3000}`,
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
