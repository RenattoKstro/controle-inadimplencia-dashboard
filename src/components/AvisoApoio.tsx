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
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 shadow-2xl border-4 border-purple-300">
          <div className="text-center mb-6">
            <Heart className="w-16 h-16 text-red-500 fill-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-purple-800">
              Aviso Importante
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-inner space-y-4 text-gray-800 text-base leading-relaxed max-h-[60vh] overflow-y-auto">
            <p>
              Este aplicativo foi desenvolvido com a intenção de ajudar pessoas, oferecendo ferramentas úteis de forma simples, prática e totalmente acessível.
            </p>
            <p>
              Desde o início, o objetivo nunca foi lucrar com o projeto, e quero reforçar que ele sempre será <strong>gratuito para todos os usuários</strong>.
            </p>
            <p>
              No entanto, para manter o aplicativo funcionando com qualidade, existem custos mensais indispensáveis, como:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>Hospedagem do site</li>
              <li>Servidor do banco de dados</li>
              <li>Serviços de backend e integrações</li>
              <li>Armazenamento e segurança</li>
              <li>Ferramentas e recursos utilizados no desenvolvimento</li>
            </ul>
            <p>
              Todos esses serviços garantem que o app continue rápido, estável e seguro para você utilizar a qualquer momento.
            </p>
            <p>
              Se você considera este aplicativo útil e quiser apoiar o projeto, qualquer contribuição — independente do valor — ajuda muito a manter tudo no ar e possibilita melhorias contínuas.
            </p>
            <p className="text-lg font-bold text-purple-700 mt-4">
              Agradeço imensamente pelo seu apoio e confiança! 🙏
            </p>
            <p className="text-green-600 font-black text-lg mt-3">
              Sua colaboração faz toda a diferença para que este projeto continue vivo.
            </p>
          </div>

          <button
            onClick={() => setEtapa("formulario")}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg py-5 rounded-2xl shadow-2xl flex items-center justify-center gap-3"
          >
            Entendi! Quero apoiar <ChevronRight className="w-6 h-6" />
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
          <h2 className="text-2xl font-black text-blue-800 text-center mb-6">
            Preencha seus dados
          </h2>

          <div className="bg-white p-6 rounded-3xl shadow-inner space-y-5">
            <div className="flex justify-center mb-4">
              <img src="/PIX.png" alt="PIX" className="w-56 h-56 rounded-2xl shadow-2xl border-8 border-white" />
            </div>

            <input
              type="text"
              placeholder="Seu nome (máx 14)"
              value={nome}
              onChange={(e) => setNome(e.target.value.toUpperCase().slice(0, 14))}
              maxLength={14}
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl text-center font-bold text-xl"
            />

            <input
              type="text"
              placeholder="Filial (apenas números)"
              value={filial}
              onChange={(e) => setFilial(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl text-center font-bold text-2xl"
            />

            <input
              type="number"
              placeholder="R$ 20"
              value={valor}
              onChange={(e) => setValor(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 border-2 border-green-400 rounded-xl text-center font-bold text-3xl text-green-600"
            />

            {erro && (
              <p className="text-red-600 font-bold text-center bg-red-50 p-3 rounded-xl border-2 border-red-300">
                {erro}
              </p>
            )}

            <button
              onClick={validarEAvancar}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-5 rounded-2xl text-lg shadow-2xl"
            >
              Continuar
            </button>

            <button
              onClick={copiarPix}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 mt-3"
            >
              <Copy className="w-5 h-5" />
              Copiar Chave PIX
            </button>

            <p className="text-center text-gray-600 mt-3 font-bold text-sm">
              Chave PIX: {pixKey}
            </p>

            <button
              onClick={() => setEtapa("mensagem")}
              className="w-full text-purple-600 font-bold mt-3"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ETAPA 3: PERGUNTA
  if (etapa === "pergunta") {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 shadow-2xl border-4 border-purple-300">
          <h2 className="text-2xl font-black text-purple-800 text-center mb-8">
            Deseja mostrar o valor doado no ranking?
          </h2>

          <div className="flex justify-center gap-8 mb-8">
            <button
              onClick={() => salvarApoio(true)}
              className="px-10 py-6 bg-green-500 hover:bg-green-600 text-white font-black text-xl rounded-2xl shadow-2xl"
            >
              SIM
            </button>
            <button
              onClick={() => salvarApoio(false)}
              className="px-10 py-6 bg-red-500 hover:bg-red-600 text-white font-black text-xl rounded-2xl shadow-2xl"
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
          <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-green-800 mb-4">
            Enviado com sucesso!
          </h2>
          <p className="text-xl text-green-700 mb-6">
            Sua doação foi enviada para aprovação.
          </p>
          <p className="text-lg text-green-600">
            Em até 24h você entra no ranking!
          </p>
          <button
            onClick={() => setEtapa("mensagem")}
            className="mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-10 rounded-2xl text-xl shadow-2xl"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
