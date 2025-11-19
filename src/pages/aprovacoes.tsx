// Aprovacoes.tsx
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Check, X, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

const supabase = createClientComponentClient();

export default function Aprovacoes() {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState<any[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("Enviando...");
  const [mostraTelaSucesso, setMostraTelaSucesso] = useState(false);

  async function carregar() {
    setLoading(true);
    const { data } = await supabase.from("solicitacoes").select("*").order("id", { ascending: false });
    setDados(data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function aprovar(id: number) {
    setEnviando(true);
    setMensagem("Aprovando...");

    await supabase.from("solicitacoes").update({ status: "aprovado" }).eq("id", id);

    setMostraTelaSucesso(true);
    dispararConfete();
    carregar();

    setTimeout(() => {
      setMostraTelaSucesso(false);
    }, 1500);

    setEnviando(false);
  }

  async function rejeitar(id: number) {
    setEnviando(true);
    setMensagem("Rejeitando...");

    await supabase.from("solicitacoes").update({ status: "rejeitado" }).eq("id", id);

    setMostraTelaSucesso(true);
    dispararConfete();
    carregar();

    setTimeout(() => {
      setMostraTelaSucesso(false);
    }, 1500);

    setEnviando(false);
  }

  function dispararConfete() {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Aprovações de Solicitações
      </h1>

      <Button
        onClick={carregar}
        className="flex items-center gap-2 mb-4"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        Atualizar
      </Button>

      <div className="w-full max-w-2xl space-y-4">
        {dados.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow p-4 flex justify-between items-center border"
          >
            <div>
              <p className="font-semibold text-gray-900">{item.nome}</p>
              <p className="text-gray-600 text-sm">{item.descricao}</p>
              <p className="text-xs mt-1 text-gray-500">Status: {item.status}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-100"
                onClick={() => aprovar(item.id)}
                disabled={enviando}
              >
                <Check />
              </Button>

              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-100"
                onClick={() => rejeitar(item.id)}
                disabled={enviando}
              >
                <X />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {mostraTelaSucesso && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center text-center">
            <Sparkles className="w-10 h-10 text-yellow-500 mb-3" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sucesso!</h2>
            <p className="text-gray-600 mb-4">Ação concluída com êxito.</p>
            <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
          </div>
        </div>
      )}
    </div>
  );
}
