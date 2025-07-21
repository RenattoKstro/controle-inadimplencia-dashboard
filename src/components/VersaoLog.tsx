import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

const VersaoLog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const versionLog = [
    { version: "1.0.8", date: "16-07-2025", changes: "Add Calc. Rent. externa, Bugs corrigidos e alterações" }, 
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-purple-400 hover:bg-purple-500 text-white font-medium rounded-md px-3 py-1 text-sm transition-colors duration-200"
        >
          Logs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border border-gray-300 rounded-md shadow-lg p-4 top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 fixed inset-0 m-auto z-50 max-h-[80vh] overflow-y-auto">
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
      </DialogContent>
    </Dialog>
  );
};

export default VersaoLog;
