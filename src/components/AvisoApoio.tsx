// src/components/AvisoApoio.tsx
import { useState } from "react";
import { MessageCircle, Copy, Heart, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function AvisoApoio() {
  const [nome, setNome] = useState("");
  const [filial, setFilial] = useState("");
  const [valor, setValor] = useState("");
  const [payload, setPayload] = useState("");
  const [mostrarQR, setMostrarQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const pixKey = "rena7oalmeida@jim.com";
  const recebedor = "RENATO CASTRO DE ALMEIDA";
  const cidade = "SAOPAULO";

  function crc16(str: string): string {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  const gerarPayload = () => {
    if (!nome.trim() || !filial.trim()) {
      alert("Preencha Nome e Filial.");
      return;
    }
    if (!valor || Number(valor) <= 0) {
      alert("Digite um valor válido para contribuir.");
      return;
    }

    const valorFormatado = Number(valor).toFixed(2).replace(".", "");
    const base =
      "000201" +
      "010211" +
      `26${"43".padStart(2, "0")}0014BR.GOV.BCB.PIX01${pixKey.length
        .toString()
        .padStart(2, "0")}${pixKey}` +
      "52040000" +
      "5303986" +
      `54${valorFormatado.length.toString().padStart(2, "0")}${valorFormatado}` +
      "5802BR" +
      `59${recebedor.length.toString().padStart(2, "0")}${recebedor}` +
      `60${cidade.length.toString().padStart(2, "0")}${cidade}` +
      "62070503***" +
      "6304";

    const crc = crc16(base);
    setPayload(base + crc);
    setMostrarQR(true);
  };

  const copiarPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-xl">
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0 bg-blue-100 p-4 rounded-2xl">
            <MessageCircle className="w-10 h-10 text-blue-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-blue-800 mb-3 flex items-center gap-3">
              Apoie o Projeto
              <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Este app é <strong>100% gratuito</strong> e sempre será.  
              Sua contribuição ajuda a pagar servidor, hospedagem e café
              <Sparkles className="inline w-4 h-4 text-yellow-500 ml-1" />
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <input
                type="text"
                placeholder="Filial"
                value={filial}
                onChange={(e) => setFilial(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <input
                type="number"
                placeholder="R$ 10,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <button
              onClick={gerarPayload}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
            >
              Gerar QR Code PIX
            </button>

            {mostrarQR && (
              <div className="mt-8 bg-white p-8 rounded-3xl shadow-2xl border-2 border-gray-100">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Escaneie e contribua!
                  </h3>
                  <div className="inline-block p-6 bg-white rounded-3xl shadow-inner">
                    <QRCodeSVG value={payload} size={220} level="H" />
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={copiarPix}
                      className={`w-full py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-3 ${
                        copied ? "bg-green-500 text-white" : "bg-blue-700 hover:bg-blue-800 text-white"
                      }`}
                    >
                      <Copy className="w-5 h-5" />
                      {copied ? "Chave copiada!" : "Copiar chave PIX"}
                    </button>

                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Chave:</strong>{" "}
                        <code className="font-mono bg-gray-100 px-2 py-1 rounded">{pixKey}</code>
                      </p>
                      <p className="mt-2 text-green-600 font-medium">
                        Obrigado por apoiar!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
