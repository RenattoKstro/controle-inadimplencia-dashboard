import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { toast } from "@/components/ui/use-toast";

console.log("Aplicação iniciada");

// FORÇA ATUALIZAÇÃO AUTOMÁTICA DO SERVICE WORKER
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);

        // Verifica atualização a cada 30 segundos
        setInterval(() => {
          registration.update();
        }, 30000);

        // Detecta nova versão instalada
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // Nova versão pronta!
                toast({
                  title: "Atualização disponível!",
                  description: "O app foi atualizado. Recarregando agora...",
                  duration: 5000,
                });
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });

  // Recarrega quando o service worker toma controle (após atualização)
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
