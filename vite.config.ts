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
    VitePWA({
      registerType: "autoUpdate", // Já estava certo — mantém
      injectRegister: "auto",

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        // Força cache busting em arquivos críticos
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(js|css)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
              },
            },
          },
        ],
      },

      manifest: {
        name: "Controle de Inadimplência",
        short_name: "Controle",
        description: "Dashboard de Controle de Inadimplência",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#9b87f5",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      // ESSA É A MÁGICA: FORÇA ATUALIZAÇÃO AUTOMÁTICA
      devOptions: {
        enabled: false,
      },
    }),
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
