import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // VitePWA desativado temporariamente
    // VitePWA({
    //   registerType: "autoUpdate",
    //   manifest: {
    //     name: "Controle de Inadimplência",
    //     short_name: "Controle",
    //     description: "Controle de Inadimplência Dashboard",
    //     start_url: "/dashboard",
    //     display: "standalone",
    //     background_color: "#ffffff",
    //     theme_color: "#9b87f5",
    //     icons: [
    //       {
    //         src: "/icon-192x192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //         purpose: "any maskable",
    //       },
    //       {
    //         src: "/icon-512x512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //         purpose: "any maskable",
    //       },
    //     ],
    //   },
    // }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["lucide-react"],
  },
  build: {
    rollupOptions: {
      external: [],
    },
    chunkSizeWarningLimit: 1000,
  },
}));
