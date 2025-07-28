// src/components/Apps.tsx
import React from "react";
import { Calculator } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import CalculadoraRentabilidade from "./dashboard/CalculadoraRentabilidade"; // Ajuste o caminho aqui

const apps = [
  { id: "calculadora", name: "Calculadora de Rentabilidade", icon: Calculator, component: CalculadoraRentabilidade },
  { id: "external-calculator", name: "Calculadora Rentabilidade (Externa)", icon: Calculator, url: "https://abre.ai/calrent" },
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
              className="w-full justify-start text-foreground hover:text-primary flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted"
            >
              <app.icon className="h-4 w-4 mr-2" />
              {app.name}
            </button>
          </a>
        ) : (
          <Dialog key={app.id}>
            <DialogTrigger asChild>
              <button
                className="w-full justify-start text-foreground hover:text-primary flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted"
              >
                <app.icon className="h-4 w-4 mr-2" />
                {app.name}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card">
              <app.component />
            </DialogContent>
          </Dialog>
        )
      )}
    </div>
  );
};

export default Apps;
