// src/components/AvisoApoio.tsx
import { useState } from "react";
import { Heart, Copy, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AvisoApoio() {
  const [nome, setNome] = useState("");
  const [filial, setFilial] = useState("");
  const [valor, setValor] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const pixKey = "rena7oalmeida@jim.com";

  const copiarPix = () => {
    navigator.clipboard.writeText(pixKey);
    alert("Chave PIX copiada!");
  };

  const salvarApoio = async () => {
    setErro("");

    // NOME: só letras, até 12, força MAIÚSCULA
    const nomeLimpo = nome.trim().replace(/[^a-zA-Z\s]/g, "").toUpperCase();
    if (nomeLimpo.length < 1 || nomeLimpo.length > 12) {
      return setErro("Nome: 1 a 12 letras (sem números ou símbolos)");
    }

    // FILIAL: só números
    if (!/^\d+$/.test(filial.trim())) {
      return setErro("Filial: apenas números");
    }

    // VALOR: inteiro positivo
    const valorNum = Number(valor);
    if (!Number.isInteger(valorNum) || valorNum < 5) {
      return setErro("Valor mínimo R$ 5 (número inteiro)");
    }

    const { error } = await supabase.from("apoiadores_pendentes").insert({
      nome: nomeLimpo,
      filial: filial.trim(),
      valor: valorNum,
    });

    if (error) {
      setErro("Erro ao enviar. Tente novamente.");
    } else {
      setEnviado(true);
      setNome("");
      setFilial("");
      setValor("");
      setTimeout(() => setEnviado(false), 5000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-800 mb-3">
            Apoie o Projeto <Heart className="inline w-8 h-8 text-red-500 fill-red-500 ml-2" />
          </h2>
          <p className="text-gray-700">
            Preencha, faça o PIX e eu coloco você no ranking!
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-inner border-2 border-gray-100 space-y-6">
          <div className="flex justify-center mb-6">
            <img src="/PIX.png" alt="PIX" className="w-64 h-64 rounded-2xl shadow-2xl border-8 border-white" />
          </div>

          <div className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Seu nome (máx 12 letras)"
                value={nome}
                onChange={(e) => setNome(e.target.value.replace(/[^a-zA-Z\s]/g, "").toUpperCase())}
                maxLength={12}
                className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl text-center font-black text-2xl tracking-wider"
              />
              <p className="text-xs text-gray-500 text-center mt-1">{nome.length}/12</p>
            </div>

            <input
              type="text"
              placeholder="Filial (apenas números)"
              value={filial}
              onChange={(e) => setFilial(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-4 border-2 border-green-400 rounded-xl text-center font-black text-3xl"
            />

            <input
              type="number"
              placeholder="R$ 20"
              value={valor}
              onChange={(e) => setValor(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-4 border-2 border-green-400 rounded-xl text-center font-black text-4xl text-green-600"
            />
          </div>

          {erro && (
            <p className="text-red-600 font-bold text-center bg-red-50 p-4 rounded-xl border-2 border-red-300">
              {erro}
            </p>
          )}

          {enviado ? (
            <div className="text-center bg-green-100 p-8 rounded-3xl border-4 border-green-500">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              <p className="text-3xl font-black text-green-800">Enviado!</p>
              <p className="text-green-700 text-xl mt-2">Aguarde aprovação</p>
            </div>
          ) : (
            <button
              onClick={salvarApoio}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black py-6 rounded-2xl text-2xl shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              Quero aparecer no ranking!
            </button>
          )}

          <button
            onClick={copiarPix}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3"
          >
            <Copy className="w-6 h-6" />
            Copiar Chave PIX
          </button>

          <p className="text-center text-gray-600 mt-4">
            Chave PIX: <strong>{pixKey}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
