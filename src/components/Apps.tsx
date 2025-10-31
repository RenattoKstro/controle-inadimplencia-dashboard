import React from "react";
import { Calculator, DollarSign, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import CalculadoraRentabilidade from "./dashboard/CalculadoraRentabilidade";
import CalculadoraVendedor90 from "./dashboard/CalculadoraVendedor90";
import TigerLinkGenerator from "./TigerLinkGenerator";
import RenegociacaoCard from "./dashboard/RenegociacaoCard";

const apps = [
  {
    id: "vendedor-90",
    name: "Calculadora Vendedor 90%",
    icon: Calculator,
    component: CalculadoraVendedor90,
  },
  {
    id: "fechamento-caixa",
    name: "Fechamento Caixa Geral",
    icon: () => (
      <div className="flex items-center opacity-100">
        <Calculator className="h-4 w-4 mr-1 text-white" />
        <DollarSign className="h-4 w-4 text-white" />
      </div>
    ),
    url: "https://fechamentodecaixa.netlify.app/",
  },
  {
    id: "calculadora",
    name: "Calculadora de Rentabilidade",
    icon: Calculator,
    component: CalculadoraRentabilidade,
  },
  {
    id: "external-calculator",
    name: "Calculadora Rentabilidade (Externa)",
    icon: Calculator,
    url: "https://abre.ai/calrent",
  },
  {
    id: "tiger-2.0",
    name: "Tiger 2.0",
    icon: () => (
      <img
        src="/tiger2.ico"
        alt="Tiger 2.0 Icon"
        className="h-6 w-6 mr-2"
        style={{ backgroundColor: "#3b82f6", padding: "2px" }}
      />
    ),
    component: TigerLinkGenerator,
  },
  {
    id: "renegociacao",
    name: "Renegociação",
    icon: () => (
      <div className="flex items-center">
        <DollarSign className="h-4 w-4 mr-1 text-white" />
        <RefreshCw className="h-3 w-3 text-white" />
      </div>
    ),
    component: RenegociacaoCard,
  },
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
              {typeof app.icon === "function" ? <app.icon /> : <app.icon className="h-4 w-4" />}
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
                    : app.id === "renegociacao"
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : ""
                }`}
              >
                {typeof app.icon === "function" ? <app.icon /> : <app.icon className="h-4 w-4" />}
                {app.name}
              </button>
            </DialogTrigger>

            {/* ✅ DIALOG FULL SCREEN */}
            <DialogContent
              className="
                max-w-screen-xl 
                w-full 
                h-[95vh] 
                bg-white 
                p-8 
                rounded-xl 
                overflow-hidden
              "
            >
              {/* ✅ Scroll interno sem quebrar o layout */}
              <div className="w-full h-full overflow-auto">
                <app.component />
              </div>
            </DialogContent>
          </Dialog>
        )
      )}
    </div>
  );
};

export default Apps;
