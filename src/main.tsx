import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Aplicação iniciada");
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker.register("/cnm-sw.js").catch((error) => {
//     console.error("Service Worker registration failed:", error);
//   });
// }

createRoot(document.getElementById("root")!).render(<App />);
