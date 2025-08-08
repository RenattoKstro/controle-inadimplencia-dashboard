import React, { useState } from "react";
import { Calculator } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import CalculadoraRentabilidade from "./dashboard/CalculadoraRentabilidade";
import CalculadoraVendedor90 from "./dashboard/CalculadoraVendedor90"; // Certifique-se de que o caminho está correto

const TigerLinkGenerator = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [downloadLink, setDownloadLink] = useState("");

  const generateLink = () => {
    if (ipAddress.trim()) {
      const fullLink = `http://${ipAddress.trim()}:8080/version/tiger-release.apk`;
      setDownloadLink(fullLink);
    } else {
      setDownloadLink("");
    }
  };

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIpAddress(e.target.value);
    if (e.target.value.trim()) {
      generateLink();
    } else {
      setDownloadLink("");
    }
  };

  const handleDownload = () => {
    if (downloadLink) {
      window.open(downloadLink, "_blank");
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Insira o IP (ex.: 10.30.59.104)"
        value={ipAddress}
        onChange={handleIpChange}
        className="w-full"
      />
      {downloadLink && (
        <Button
          onClick={handleDownload}
          className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white"
        >
          Download
        </Button>
      )}
      {downloadLink && (
        <p className="text-sm text-muted-foreground mt-1">
          Link gerado: <a href={downloadLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{downloadLink}</a>
        </p>
      )}
    </div>
  );
};

const apps = [
  { id: "vendedor-90", name: "Calculadora Vendedor 90%", icon: Calculator, component: CalculadoraVendedor90 },
  { id: "fechamento-caixa", name: "Fechamento Caixa Geral (em breve)", icon: Calculator, disabled: true }, // Segunda posição
  { id: "calculadora", name: "Calculadora de Rentabilidade", icon: Calculator, component: CalculadoraRentabilidade },
  { id: "external-calculator", name: "Calculadora Rentabilidade (Externa)", icon: Calculator, url: "https://abre.ai/calrent" },
  { id: "tiger-2.0", name: "Tiger 2.0", icon: () => <img src="/tiger2.ico" alt="Tiger 2.0 Icon" className="h-4 w-4 mr-2" />, component: TigerLinkGenerator },
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
              <app.icon />
              {app.name}
            </button>
          </a>
        ) : app.disabled ? (
          <button
            key={app.id}
            className="w-full justify-start text-gray-400 cursor-not-allowed flex items-center gap-2 px-4 py-2 rounded-md bg-muted"
            disabled
          >
            <app.icon />
            {app.name}
          </button>
        ) : (
          <Dialog key={app.id}>
            <DialogTrigger asChild>
              <button
                className="w-full justify-start text-foreground hover:text-primary flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted"
              >
                <app.icon />
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
