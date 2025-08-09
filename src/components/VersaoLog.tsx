import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react"; // Ícone de sino
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const VersaoLog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const versionLog = [
    { version: "2.3", date: "09-08-2025", changes: "Add Fechamento de Caixa Geral" },
    { version: "2.2", date: "08-08-2025", changes: "Add Gerador de link Tiger 2.0; Agora o tempo pra expirar o login foi aumentado" },
    { version: "2.1", date: "07-08-2025", changes: "Bugs corrigidos, Card Dias Restentes alterado para corrigir o GAP" },
    { version: "2.0", date: "29-07-2025", changes: "Add Calculadora Vendedor 90%" },
    { version: "1.9", date: "21-07-2025", changes: "Add Scripts e Percentual de Inadimplência" },
    { version: "1.8", date: "16-07-2025", changes: "Add Calc. Rent. externa, Bugs corrigidos e alterações" }, 
    { version: "1.7", date: "11-07-2025", changes: "Add Cards de Projeções e Tema Escuro/Claro" },
    { version: "1.6", date: "09-07-2025", changes: "Add Guia Históricos mensal e diário" },
    { version: "1.5", date: "07-07-2025", changes: "Add Card de GAP Positivo/Negativo" },
    { version: "1.4", date: "01-07-2025", changes: "Add Calc. Rentabilidade" },
    { version: "1.3", date: "26-06-2025", changes: "Add Print Tela, Anexos, Rel. Sabium" },
    { version: "1.2", date: "22-06-2025", changes: "Add Calendário" },
    { version: "1.1", date: "19-06-2025", changes: "Add Op. Cadastro em Meus Premios" },
    { version: "1.0.0", date: "05-02-2025", changes: "App Lançado em beta" },
  ];

  const latestVersion = versionLog[0].version; // Versão mais recente
  const [lastViewedVersion, setLastViewedVersion] = useState<string | null>(
    localStorage.getItem("lastViewedVersion")
  );
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (lastViewedVersion !== latestVersion) {
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [lastViewedVersion, latestVersion]);

  const handleClose = () => {
    setIsOpen(false);
    if (showNotification) {
      localStorage.setItem("lastViewedVersion", latestVersion);
      setLastViewedVersion(latestVersion);
      setShowNotification(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-black hover:bg-red-600 text-white font-medium rounded-md px-3 py-1 text-sm transition-colors duration-200 relative"
        >
          <span>Logs</span>
          {showNotification && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center -mt-1 -mr-1">
              <Bell className="h-3 w-3 mr-1" />1
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border border-gray-300 rounded-md shadow-lg p-6 max-h-[80vh] overflow-y-auto">
        {showNotification && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 mb-4 rounded-md">
            Nova versão detectada: {latestVersion}! Alterações: {versionLog[0].changes}
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground mb-4">Logs de Atualizações</h3>
        <ul className="space-y-2">
          {versionLog.map((log, index) => (
            <li key={index} className="text-sm text-foreground">
              <span className="font-medium">{log.version}</span> - {log.date}
              <p className="text-muted-foreground ml-4">{log.changes}</p>
            </li>
          ))}
        </ul>
        <DialogClose asChild>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={handleClose}
          >
            Fechar
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default VersaoLog;
