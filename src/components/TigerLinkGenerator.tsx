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
      console.log("Tentando iniciar download para:", downloadLink);
      // Criar um elemento <a> temporário e simular clique
      const link = document.createElement("a");
      link.href = downloadLink;
      link.download = "tiger-release.apk"; // Nome do arquivo
      link.target = "_blank"; // Abrir em nova aba como fallback
      document.body.appendChild(link);
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      link.dispatchEvent(clickEvent);
      document.body.removeChild(link);

      // Fallback adicional: verificar se o download falhou
      setTimeout(() => {
        if (!document.querySelector(`a[href="${downloadLink}"][download]`)) {
          console.log("Download falhou, tentando redirecionamento...");
          window.location.href = downloadLink;
        }
      }, 1000); // Aguarda 1 segundo
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
