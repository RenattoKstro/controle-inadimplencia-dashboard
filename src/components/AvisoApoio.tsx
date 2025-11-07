// src/components/AvisoApoio.tsx
import { useState } from "react";
import { Heart, Copy, Sparkles, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AvisoApoio() {
  const [nome, setNome] = useState("");
  const [filial, setFilial] = useState("");
  const [valor, setValor] = useState("");
  const [copied, setCopied] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const pixKey = "rena7oalmeida@jim.com";

  const copiarPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const salvarApoio = async () => {
    if (!nome.trim() || !filial.trim() || !valor || Number(valor) <= 0) {
      alert("Preencha todos os campos!");
      return;
    }

    const { error } = await supabase.from("apoiadores").insert({
      nome: nome.trim(),
      filial: filial.trim(),
      valor: Number(valor),
    });

    if (error) {
      alert("Erro ao salvar. Tente novamente.");
      console.error(error);
    } else {
      setEnviado(true);
      setTimeout(() => {
        setNome("");
        setFilial("");
        setValor("");
        setEnviado(false);
      }, 3000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <QrCode className="w-10 h-10 text-blue-700" />
          </div>
          <h2 className="text-3xl font-bold text-blue-800 mb-3">
            Apoie o Projeto <Heart className="inline w-8 h-8 text-red-500 fill-red-500 ml-2" />
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Este app é <strong>100% gratuito</strong>. Sua doação mantém tudo vivo!
            <Sparkles className="inline w-5 h-5 text-yellow-500 ml-1" />
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-inner border-2 border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Filial"
              value={filial}
              onChange={(e) => setFilial(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="number"
              placeholder="R$ 10,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-center">
            <img
              src="/PIX.png"
              alt="QR Code PIX"
              className="w-64 h-64 rounded-2xl shadow-2xl border-8 border-white"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-2 text-center">Chave PIX:</p>
            <code className="block font-mono text-lg bg-white px-4 py-3 rounded-lg border border-gray-300 text-center">
              {pixKey}
            </code>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copiarPix}
              className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                copied ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <Copy className="w-6 h-6" />
              {copied ? "Copiado!" : "Copiar Chave"}
            </button>

            <button
              onClick={salvarApoio}
              disabled={enviado}
              className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                enviado
                  ? "bg-green-600 text-white"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              }`}
            >
              {enviado ? "Salvo!" : "Entrar no Ranking"}
            </button>
          </div>

          <p className="text-center text-green-600 font-bold text-lg">
            Qualquer valor faz diferença!
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Desenvolvido com carinho por <span className="font-bold text-pink-600">@renato_alme1da</span></p>
        </div>
      </div>
    </div>
  );
}
