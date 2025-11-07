// src/components/AvisoApoio.tsx
import { Heart, Copy, Sparkles, QrCode } from "lucide-react";

export default function AvisoApoio() {
  const pixKey = "rena7oalmeida@jim.com";

  const copiarPix = () => {
    navigator.clipboard.writeText(pixKey);
    alert("Chave PIX copiada com sucesso!");
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
            Este app é <strong>100% gratuito</strong> e sempre será.  
            Sua contribuição ajuda a manter o servidor, o site e o banco de dados!
            <Sparkles className="inline w-5 h-5 text-yellow-500 ml-1" />
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-inner border-2 border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Escaneie ou copie a chave PIX
          </h3>

          <div className="flex justify-center mb-6">
            <img 
              src="/PIX.png" 
              alt="QR Code PIX" 
              className="w-64 h-64 rounded-2xl shadow-lg border-4 border-gray-200"
            />
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Chave PIX (e-mail):</p>
              <code className="block font-mono text-lg bg-white px-4 py-3 rounded-lg border border-gray-300 text-center">
                {pixKey}
              </code>
            </div>

            <button
              onClick={copiarPix}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Copy className="w-6 h-6" />
              Copiar Chave PIX
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-green-600 font-bold text-lg">
              Qualquer valor faz diferença!
            </p>
            <p className="text-gray-600 mt-2">
              Você escolhe quanto doar direto no app do seu banco.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Desenvolvido por <span className="font-bold text-pink-600">@renato_alme1da</span></p>
        </div>
      </div>
    </div>
  );
}
