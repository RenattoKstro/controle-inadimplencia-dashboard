// VersaoLog.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const VersaoLog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const versionLog = [
    { version: "1.0.7", date: "11-07-2025", changes: "Add Cards de Projeções e Tema Escuro/Claro" },
    { version: "1.0.6", date: "09-07-2025", changes: "Add Guia Históricos mensal e diário" },
    { version: "1.0.5", date: "07-07-2025", changes: "Add Card de GAP Positivo/Negativo" },
    { version: "1.0.4", date: "01-07-2025", changes: "Add Calc. Rentabilidade" },
    { version: "1.0.3", date: "26-06-2025", changes: "Add Print Tela, Anexos, Rel. Sabium" },
    { version: "1.0.2", date: "22-06-2025", changes: "Add Calendário" },
    { version: "1.0.1", date: "19-06-2025", changes: "Add Op. Cadastro em Meus Premios" },
    { version: "1.0.0", date: "05-02-2025", changes: "App Lançado em beta" },
  ];

  return (
    <div className="relative inline-flex items-center">
      <span className="text-foreground font-semibold mr-2"></span>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-400 hover:bg-purple-500 text-white font-medium rounded-md px-3 py-1 text-sm transition-colors duration-200"
      >
        Logs
      </Button>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-80 bg-card border border-gray-300 rounded-md shadow-lg p-4 top-full left-0">
          <h3 className="text-lg font-semibold text-foreground">Logs de Atualizações</h3>
          <ul className="mt-2 space-y-2">
            {versionLog.map((log, index) => (
              <li key={index} className="text-sm text-foreground">
                <span className="font-medium">{log.version}</span> - {log.date}
                <p className="text-muted-foreground ml-4">{log.changes}</p>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => setIsOpen(false)}
          >
            Fechar
          </Button>
        </div>
      )}
    </div>
  );
};

export default VersaoLog;