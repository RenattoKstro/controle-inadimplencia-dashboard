// src/pages/aprovacoes.tsx  → VERSÃO QUE FUNCIONA NO SEU PROJETO AGORA!
import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, RefreshCw, Trophy, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pendente {
  id: string;
  nome: string;
  filial: string;
  valor: number;
  created_at: string;
}

export default function PainelAprovacoes() {
  const user = useUser(); // ← este funciona no Pages Router
  const [pendentes, setPendentes] = useState<Pendente[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Só permite o Renato
  if (!user || user.email !== "rks7ro@gmail.com") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <Shield className="w-32 h-32 mx-auto mb-8" />
          <h1 className="text-5xl font-black mb-6">Acesso Restrito</h1>
          <p className="text-2xl mb-8">Apenas rks7ro@gmail.com</p>
          <Button size="lg" onClick={() => window.location.href = "/"}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const buscarPendentes = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from("apoiadores_pendentes")
      .select("*")
      .order("created_at", { ascending: false });
    setPendentes(data || []);
    setCarregando(false);
  };

  useEffect(() => {
    buscarPendentes();
    const interval = setInterval(buscarPendentes, 30000);
    return () => clearInterval(interval);
  }, []);

  const aprovar = async (item: Pendente) => {
    await supabase.from("apoiadores").insert({
      nome: item.nome,
      filial: item.filial,
      valor: item.valor,
    });
    await supabase.from("apoiadores_pendentes").delete().eq("id", item.id);
    buscarPendentes();
    alert(`${item.nome} entrou no ranking!`);
  };

  const rejeitar = async (id: string) => {
    await supabase.from("apoiadores_pendentes").delete().eq("id", id);
    buscarPendentes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-7xl font-black text-purple-800">
            Painel do Renato
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-300">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-bold">Pendentes: {pendentes.length}</h2>
            <Button onClick={buscarPendentes} size="lg">
              <RefreshCw className={`w-8 h-8 mr-2 ${carregando ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {pendentes.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-40 h-40 text-yellow-500 mx-auto mb-8" />
              <p className="text-5xl font-black text-gray-700">Tudo aprovado!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {pendentes.map((p) => (
                <div key={p.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-10 border-4 border-purple-400">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                      <p className="text-5xl font-black text-purple-800">{p.nome}</p>
                      <p className="text-3xl text-purple-600">{p.filial}</p>
                      <p className="text-6xl font-black text-green-600 mt-4">
                        R$ {p.valor.toFixed(0)}
                      </p>
                    </div>
                    <div className="flex gap-6">
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white font-black text-3xl px-16 py-10"
                        onClick={() => aprovar(p)}
                      >
                        APROVAR
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        className="text-3xl font-black px-16 py-10"
                        onClick={() => rejeitar(p.id)}
                      >
                        REJEITAR
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
