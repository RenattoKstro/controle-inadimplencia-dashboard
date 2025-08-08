import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TigerLinkGenerator = () => {
  const [ipAddress, setIpAddress] = useState("");

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIpAddress(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedChars = /[0-9.]/;
    if (!allowedChars.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleDownload = () => {
    if (ipAddress.trim()) {
      const link = `http://${ipAddress.trim()}:8080/v1/app/download`;
      window.open(link, "_blank");
    } else {
      alert("Por favor, insira um IP válido.");
    }
  };

  const handleHelpClick = () => {
    window.open("/ipsiga.png", "_blank"); // imagem em public/ipsiga.png
  };

  return (
    <div className="space-y-2 p-4">
      <Input
        type="text"
        placeholder="Insira o IP (ex.: 10.30.59.104)"
        value={ipAddress}
        onChange={handleIpChange}
        onKeyPress={handleKeyPress}
        className="w-full"
      />

      <Button
        onClick={handleDownload}
        className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white"
      >
        Abrir em nova guia
      </Button>

      <p className="text-sm mt-2">
        <button
          type="button"
          onClick={handleHelpClick}
          className="text-blue-500 hover:underline"
        >
          Como saber o meu IP?
        </button>
      </p>
    </div>
  );
};

export default TigerLinkGenerator;
