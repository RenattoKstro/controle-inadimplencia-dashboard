import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TigerLinkGenerator = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [downloadLink, setDownloadLink] = useState("");

  useEffect(() => {
    console.log("TigerLinkGenerator montado ou atualizado, ipAddress:", ipAddress);
  }, [ipAddress]); // Adicionado ipAddress como dependência para rastrear mudanças

  const generateLink = () => {
    console.log("Gerando link para IP bruto:", ipAddress); // Depuração do IP original
    if (ipAddress.trim()) {
      const fullLink = `http://${ipAddress.trim()}:8080/version/tiger-release.apk`; // Usando o IP diretamente
      console.log("Link gerado:", fullLink); // Depuração do link
      setDownloadLink(fullLink);
    } else {
      setDownloadLink("");
    }
  };

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIp = e.target.value;
    console.log("Tecla pressionada, IP inserido:", newIp); // Depuração a cada mudança
    setIpAddress(newIp);
    if (newIp.trim()) {
      generateLink();
    } else {
      setDownloadLink("");
    }
  };

  const handleDownload = () => {
    if (downloadLink) {
      console.log("Abrindo link para download:", downloadLink);
      window.open(downloadLink, "_blank");
    }
  };

  return (
    <div className="space-y-2 p-4">
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
      {!downloadLink && <p className="text-sm text-muted-foreground mt-1">Insira um IP válido para gerar o link.</p>}
    </div>
  );
};

export default TigerLinkGenerator;
