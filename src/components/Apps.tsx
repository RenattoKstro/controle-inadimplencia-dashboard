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

const apps = [
  {
    id: "vendedor-90",
    name: "Calculadora Vendedor 90%",
    icon: Calculator,
    component: CalculadoraVendedor90,
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
];

const Apps = () => {
  return (
    <div className="py-2 flex flex-wrap items-center gap-2">
      {apps.map((app) =>
        app.url ? (
          <a
            key={app.id}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white/90 px-2.5 text-xs text-slate-700 outline-none hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {typeof app.icon === "function" ? <app.icon /> : <app.icon className="h-4 w-4" />}
              {app.name}
            </button>
          </a>
        ) : (
          <Dialog key={app.id}>
            <DialogTrigger asChild>
              <button
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white/90 px-2.5 text-xs text-slate-700 outline-none hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
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
