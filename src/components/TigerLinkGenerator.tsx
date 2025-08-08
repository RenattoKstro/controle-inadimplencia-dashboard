import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TigerLinkGenerator = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [downloadLink, setDownloadLink] = useState("");

  useEffect(() => {
    console.log("TigerLinkGenerator atualizado, ipAddress:", ipAddress);
    if (ipAddress.trim()) {
      const fullLink = `http://${ipAddress.trim()}:8080/version/tiger-release.apk`;
      console.log("Link gerado no useEffect:", fullLink);
      setDownloadLink(fullLink);
    } else {
      setDownloadLink("");
    }
  }, [ipAddress]);

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIp = e.target.value;
    console.log("Tecla pressionada, IP inserido:", newIp);
    setIpAddress(newIp);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedChars = /[0-9.]/; // Permite apenas números e pontos
    if (!allowedChars.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleDownload = () => {
    if (downloadLink) {
      console.log("Tentando abrir link:", downloadLink);
      const newWindow = window.open(downloadLink, "_blank");
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        console.log("Pop-up bloqueado, redirecionando...");
        window.location.href = downloadLink; // Fallback para redirecionamento
      }
    }
  };

  return (
    <div className="space-y-2 p-4">
      <Input
        type="text"
        placeholder="Insira o IP (ex.: 10.30.59.104)"
        value={ipAddress}
        onChange={handleIpChange}
        onKeyPress={handleKeyPress} // Restringe caracteres
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
