// src/components/AvisoApoio.tsx
import { useState } from "react";
import { Heart, CheckCircle, AlertCircle, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AvisoApoio() {
  const [nome, setNome] = useState("");
  const [filial, setFilial] = useState("");
  const [valor, setValor] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const enviarParaAprovacao = async () => {
    setErro("");

    if (!nome.trim()) return setErro("Digite seu nome");
    if (nome.trim().length > 14) return setErro("Nome: máximo 14 caracteres");
    if (!filial.trim()) return setErro("Digite sua filial");
    if (!valor || Number(valor) < 5 || !Number.isInteger(Number(valor))) 
      return setErro("Valor mínimo R$ 5 (número inteiro)");

    const { error } = await supabase
      .from("apoiadores_pendentes")
      .insert({
        nome: nome.trim().substring(0, 14),
        filial: filial.trim(),
        valor: Number(valor)
      });

    if (error) {
      console.error(error);
      setErro("Erro ao enviar. Tente novamente.");
    } else {
      setEnviado(true);
      setNome("");
      setFilial("");
      setValor("");
      setTimeout(() => setEnviado(false), 6000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-2xl border-4 border-purple-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-purple-800">
            Apoie o Projeto <Heart className="inline fill-red-500 text-red-500 ml-2" />
          </h2>
          <p className="text-lg mt-4 font-medium">
            1. Faça o PIX<br/>
            2. Preencha abaixo<br/>
            3. Eu aprovo → você entra no ranking!
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-inner space-y-6">
          <div className="flex justify-center">
            <img src="/PIX.png" alt="PIX" className="w-64 h-64 rounded-2xl shadow-2xl border-8 border-purple-200" />
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Seu nome (máx 14)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={14}
              className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl text-center font-bold text-lg"
            />
            <input
              type="text"
              placeholder="Filial"
              value={filial}
              onChange={(e) => setFilial(e.target.value)}
              className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl text-center"
            />
            <input
              type="number"
              placeholder="R$ 20"
              value={valor}
              onChange={(e) => setValor(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-4 border-2 border-green-400 rounded-xl text-center text-3xl font-black text-green-600"
            />
          </div>

          {erro && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 text-red-700 font-bold text-center">
              <AlertCircle className="inline mr-2" /> {erro}
            </div>
          )}

          {enviado ? (
            <div className="text-center bg-green-100 p-8 rounded-3xl border-4 border-green-500">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              <p className="text-3xl font-black text-green-800">Enviado com sucesso!</p>
              <p className="text-green-700 text-lg mt-2">Vou aprovar em até 24h</p>
            </div>
          ) : (
            <button
              onClick={enviarParaAprovacao}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black py-6 rounded-2xl text-2xl shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              Quero aparecer no ranking!
            </button>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-purple-700 font-bold">
            Chave PIX: rena7oalmeida@jim.com
          </p>
        </div>
      </div>
    </div>
  );
}
