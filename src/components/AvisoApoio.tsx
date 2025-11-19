// src/components/AvisoApoio.tsx
import { useState } from "react";
import { Heart, Copy, CheckCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AvisoApoio() {
  const [etapa, setEtapa] = useState<"mensagem" | "formulario" | "pergunta" | "enviado">("mensagem");
  const [nome, setNome] = useState("");
  const [filial, setFilial] = useState("");
  const [valor, setValor] = useState("");
  const [mostrarValor, setMostrarValor] = useState<boolean | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const pixKey = "rena7oalmeida@jim.com";

  const copiarPix = () => {
    navigator.clipboard.writeText(pixKey);
    alert("Chave PIX copiada!");
  };

  const validarEAvancar = () => {
    setErro("");

    if (nome.trim().length < 1 || nome.trim().length > 14) return setErro("Nome: 1 a 14 letras");
    if (!filial.trim() || !/^\d+$/.test(filial)) return setErro("Filial: apenas números");
    if (!valor || !Number.isInteger(Number(valor)) || Number(valor) < 5) return setErro("Valor mínimo R$ 5 (inteiro)");

    setEtapa("pergunta");
  };

  const salvarApoio = async (mostrar: boolean) => {
    const { error } = await supabase.from("apoiadores_pendentes").insert({
      nome: nome.trim().toUpperCase().substring(0, 14),
      filial: filial.trim(),
      valor: Number(valor),
      mostrar_valor: mostrar,
    });

    if (error) {
      setErro("Erro ao enviar. Tente novamente.");
      console.error(error);
    } else {
      setEnviado(true);
      setTimeout(() => {
        setEtapa("mensagem");
        setNome("");
        setFilial("");
        setValor("");
        setMostrarValor(null);
        setEnviado(false);
      }, 5000);
    }
  };

  // ETAPA 1: MENSAGEM
  if (etapa === "mensagem") {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 shadow-2xl border-4 border-purple-300">
          {/* Sua mensagem completa aqui */}
          <button
            onClick={() => setEtapa("formulario")}
            className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xl py-6 rounded-2xl shadow-2xl flex items-center justify-center gap-3"
          >
            Entendi! Quero apoiar <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    );
  }

  // ETAPA 2: FORMULÁRIO
  if (etapa === "formulario") {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-2xl border-4 border-blue-300">
          {/* Formulário + QR Code + Chave PIX */}
          <button onClick={validarEAvancar} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-6 rounded-2xl text-2xl">
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // ETAPA 3: PERGUNTA
  if (etapa === "pergunta") {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 shadow-2xl border-4 border-purple-300">
          <h2 className="text-3xl font-black text-purple-800 text-center mb-8">
            Deseja mostrar o valor doado no ranking?
          </h2>

          <div className="flex justify-center gap-8 mb-8">
            <button
              onClick={() => salvarApoio(true)}
              className="px-12 py-8 bg-green-500 hover:bg-green-600 text-white font-black text-2xl rounded-2xl shadow-2xl"
            >
              SIM
            </button>
            <button
              onClick={() => salvarApoio(false)}
              className="px-12 py-8 bg-red-500 hover:bg-red-600 text-white font-black text-2xl rounded-2xl shadow-2xl"
            >
              NÃO
            </button>
          </div>

          <button
            onClick={() => setEtapa("formulario")}
            className="w-full text-purple-600 font-bold"
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  // ETAPA 4: ENVIADO
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-10 shadow-2xl border-4 border-green-500">
        <div className="text-center">
          <CheckCircle className="w-32 h-32 text-green-600 mx-auto mb-8" />
          <h2 className="text-4xl font-black text-green-800 mb-6">
            Enviado com sucesso!
          </h2>
          <p className="text-2xl text-green-700 mb-8">
            Sua doação foi enviada para aprovação.
          </p>
          <p className="text-xl text-green-600">
            Em até 24h você entra no ranking!
          </p>
          <button
            onClick={() => setEtapa("mensagem")}
            className="mt-10 bg-green-600 hover:bg-green-700 text-white font-black py-6 px-12 rounded-2xl text-2xl shadow-2xl"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
