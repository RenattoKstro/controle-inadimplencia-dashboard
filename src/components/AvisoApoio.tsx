// src/components/AvisoApoio.tsx
import { useState } from "react";
import { Heart, Copy, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AvisoApoio() {
  const [etapa, setEtapa] = useState<"mensagem" | "formulario" | "pergunta">("mensagem");
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

  const salvar = async () => {
    if (mostrarValor === null) return;

    const { error } = await supabase.from("apoiadores_pendentes").insert({
      nome: nome.trim().toUpperCase().substring(0, 14),
      filial: filial.trim(),
      valor: Number(valor),
      mostrar_valor: mostrarValor,
    });

    if (error) {
      setErro("Erro ao enviar.");
    } else {
      setEnviado(true);
      setTimeout(() => setEtapa("mensagem"), 5000);
    }
  };

  // MENSAGEM
  if (etapa === "mensagem") {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 shadow-2xl border-4 border-purple-300">
          {/* ... (mesmo texto da mensagem que você mandou) */}
          <button onClick={() => setEtapa("formulario")} className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xl py-6 rounded-2xl shadow-2xl">
            Entendi! Quero apoiar
          </button>
        </div>
      </div>
    );
  }

  // FORMULÁRIO
  if (etapa === "formulario") {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-2xl border-4 border-blue-300">
          {/* ... (mesmo formulário que já tinha) */}
          <button onClick={validarEAvancar} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-6 rounded-2xl text-2xl">
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // PERGUNTA
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 shadow-2xl border-4 border-purple-300">
        <h2 className="text-3xl font-black text-purple-800 text-center mb-8">
          Deseja mostrar o valor doado no ranking?
        </h2>

        <div className="flex justify-center gap-8 mb-8">
          <button
            onClick={() => {
              setMostrarValor(true);
              salvar();
            }}
            className="px-12 py-8 bg-green-500 hover:bg-green-600 text-white font-black text-2xl rounded-2xl shadow-2xl"
          >
            SIM
          </button>
          <button
            onClick={() => {
              setMostrarValor(false);
              salvar();
            }}
            className="px-12 py-8 bg-red-500 hover:bg-red-600 text-white font-black text-2xl rounded-2xl shadow-2xl"
          >
            NÃO
          </button>
        </div>

        <Button variant="ghost" onClick={() => setEtapa("formulario")} className="w-full">
          ← Voltar
        </Button>
      </div>
    </div>
  );
}
