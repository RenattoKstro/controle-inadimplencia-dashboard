import React from "react";
import { Calculator, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

// Importação dos componentes com tratamento de erro
let CalculadoraRentabilidade;
try {
  CalculadoraRentabilidade = require("./dashboard/CalculadoraRentabilidade").default;
  console.log("CalculadoraRentabilidade carregada com sucesso");
} catch (error) {
  console.error("Erro ao carregar CalculadoraRentabilidade:", error);
}

let CalculadoraVendedor90;
try {
  CalculadoraVendedor90 = require("./dashboard/CalculadoraVendedor90").default;
  console.log("CalculadoraVendedor90 carregada com sucesso");
} catch (error) {
  console.error("Erro ao carregar CalculadoraVendedor90:", error);
}

let TigerLinkGenerator;
try {
  TigerLinkGenerator = require("./TigerLinkGenerator").default;
  console.log("TigerLinkGenerator carregada com sucesso");
} catch (error) {
  console.error("Erro ao carregar TigerLinkGenerator:", error);
}

const apps = [
  { id: "vendedor-90", name: "Calculadora Vendedor 90%", icon: Calculator, component: CalculadoraVendedor90 },
  { id: "fechamento-caixa", name: "Fechamento Caixa Geral", icon: () => {
    console.log("Renderizando ícone de Fechamento Caixa Geral");
    return (
      <div className="flex items-center opacity-100 !important min-h-4 min-w-4 debug-icon">
        <Calculator className="h-4 w-4 mr-1 text-blue-500" />
        <DollarSign className="h-4 w-4 text-blue-500" />
      </div>
    );
  }, url: "https://fechamentodecaixa.netlify.app/" },
  { id: "calculadora", name: "Calculadora de Rentabilidade", icon: Calculator, component: CalculadoraRentabilidade },
  { id: "external-calculator", name: "Calculadora Rentabilidade (Externa)", icon: Calculator, url: "https://abre.ai/calrent" },
  { id: "tiger-2.0", name: "Tiger 2.0", icon: () => <img src="/tiger2.ico" alt="Tiger 2.0 Icon" className="h-6 w-6 mr-2" style={{ backgroundColor: "#3b82f6", padding: "2px" }} />, component: TigerLinkGenerator },
];

const Apps = () => {
  return (
    <div className="py-4 flex-1 space-y-2">
      {apps.map((app) =>
        app.url ? (
          <a
            key={app.id}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <button
              className={`w-full justify-start text-foreground hover:text-primary flex items-center gap-2 px-4 py-2 rounded-md outline-none focus:outline-none focus:ring-0 ${
                app.id === "external-calculator"
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : app.id === "fechamento-caixa"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : ""
              }`}
            >
              <div className="flex-shrink-0 debug-icon-container">{app.icon()}</div>
              {app.name}
            </button>
          </a>
        ) : (
          <Dialog key={app.id}>
            <DialogTrigger asChild>
              <button
                className={`w-full justify-start text-foreground hover:text-primary flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted outline-none focus:outline-none focus:ring-0 ${
                  app.id === "vendedor-90"
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : app.id === "calculadora"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : app.id === "tiger-2.0"
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : ""
                }`}
                onClick={() => console.log(`Abrindo ${app.name} dialog`)}
              >
                <app.icon />
                {app.name}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card">
              {app.component ? (
                <app.component />
              ) : (
                <div className="text-red-500">Erro: Componente não carregado!</div>
              )}
            </DialogContent>
          </Dialog>
        )
      )}
    </div>
  );
};

// CSS inline para depuração
const styles = `
  .debug-icon {
    display: flex !important;
    visibility: visible !important;
  }
  .debug-icon-container {
    display: flex !important;
    flex-shrink: 0 !important;
    min-height: 1rem !important;
    min-width: 2rem !important;
  }
`;
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Apps;
