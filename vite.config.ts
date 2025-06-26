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
    //     short_name: "Controle", // Corrigido: removido " extra
    //     description: "Controle de Inadimplência Dashboard", // Corrigido
    //     start_url: "/dashboard", // Corrigido
    //     display: "standalone", // Corrigido
    //     background_color: "#ffffff", // Corrigido
    //     theme_color: "#9b87f5", // Corrigido
    //     icons: [
    //       {
    //         src: "/icon-192x192.png", // Corrigido
    //         sizes: "192x192", // Corrigido
    //         type: "image/png", // Corrigido
    //         purpose: "any maskable", // Corrigido
    //       },
    //       {
    //         src: "/icon-512x512.png", // Corrigido
    //         sizes: "512x512", // Corrigido
    //         type: "image/png", // Corrigido
    //         purpose: "any maskable", // Corrigido
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
}));
