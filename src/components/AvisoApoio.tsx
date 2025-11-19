// src/components/AvisoApoio.tsx
import { useState } from "react";
import { Heart, Copy, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AvisoApoio() {
  const [mostrarMensagem, setMostrarMensagem] = useState(true);
  const [copied, setCopied] = useState(false);

  const pixKey = "rena7oalmeida@jim.com";

  const copiarPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (mostrarMensagem) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 shadow-2xl border-4 border-purple-300">
          <div className="text-center mb-8">
            <Heart className="w-20 h-20 text-red-500 fill-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-purple-800 mb-6">
              Aviso Importante
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-inner space-y-5 text-gray-800 text-lg leading-relaxed">
            <p>
              Este aplicativo foi desenvolvido com a intenção de ajudar pessoas, oferecendo ferramentas úteis de forma simples, prática e totalmente acessível.
            </p>
            <p>
              Desde o início, o objetivo nunca foi lucrar com o projeto, e quero reforçar que ele sempre será <strong>gratuito para todos os usuários</strong>.
            </p>
            <p>
              No entanto, para manter o aplicativo funcionando com qualidade, existem custos mensais indispensáveis, como:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
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
            <p className="text-xl font-bold text-purple-700 mt-6">
              Agradeço imensamente pelo seu apoio e confiança! 🙏
            </p>
            <p className="text-green-600 font-black text-xl mt-4">
              Sua colaboração faz toda a diferença para que este projeto continue vivo.
            </p>
          </div>

          <Button
            className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-xl py-6 rounded-2xl shadow-2xl"
            onClick={() => setMostrarMensagem(false)}
          >
            Entendi! Quero apoiar <ChevronRight className="w-6 h-6 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // SEGUNDA TELA — QR CODE
  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-2xl border-4 border-blue-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-blue-800">
            Faça sua doação via PIX
          </h2>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-inner">
          <div className="flex justify-center mb-8">
            <img src="/PIX.png" alt="PIX" className="w-72 h-72 rounded-2xl shadow-2xl border-8 border-white" />
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <p className="text-sm text-gray-600 mb-2 text-center">Chave PIX:</p>
            <code className="block font-mono text-lg bg-white px-4 py-3 rounded-lg border border-gray-300 text-center">
              {pixKey}
            </code>
          </div>

          <button
            onClick={copiarPix}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
              copied ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <Copy className="w-6 h-6" />
            {copied ? "Copiado!" : "Copiar Chave PIX"}
          </button>

          <Button
            variant="ghost"
            className="w-full mt-6 text-purple-600 font-bold"
            onClick={() => setMostrarMensagem(true)}
          >
            <X className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>

        <p className="text-center mt-6 text-green-600 font-bold text-lg">
          Qualquer valor faz diferença!
        </p>
      </div>
    </div>
  );
}
