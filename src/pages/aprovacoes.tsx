// src/pages/aprovacoes.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, RefreshCw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pendente {
  id: string;
  nome: string;
  filial: string;
  valor: number;
  created_at: string;
}

export default function AprovacoesAdmin() {
  const [user, setUser] = useState<any>(null);
  const [pendentes, setPendentes] = useState<Pendente[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email === "rks7ro@gmail.com") {
        setUser(data.user);
      } else {
        window.location.href = "/";
      }
    });
  }, []);

  const fetchPendentes = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from("apoiadores_pendentes")
      .select("*")
      .order("created_at", { ascending: false });
    setPendentes(data || []);
    setCarregando(false);
  };

  useEffect(() => {
    if (user) fetchPendentes();
  }, [user]);

  const aprovar = async (item: Pendente) => {
    await supabase.from("apoiadores").insert({
      nome: item.nome,
      filial: item.filial,
      valor: item.valor,
    });
    await supabase.from("apoiadores_pendentes").delete().eq("id", item.id);
    fetchPendentes();
    alert(`${item.nome} entrou no ranking!`);
  };

  const rejeitar = async (id: string) => {
    await supabase.from("apoiadores_pendentes").delete().eq("id", id);
    fetchPendentes();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="text-center text-white">
          <h1 className="text-4xl font-black mb-6">Acesso Restrito</h1>
          <p className="text-xl">Apenas rks7ro@gmail.com</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-purple-800 text-center mb-10">
          Painel de Aprovação
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Pendentes: {pendentes.length}
            </h2>
            <Button onClick={fetchPendentes} size="lg" className="gap-2">
              <RefreshCw className={`w-5 h-5 ${carregando ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {carregando ? (
            <p className="text-center py-16 text-gray-500">Carregando...</p>
          ) : pendentes.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
              <p className="text-2xl font-black text-gray-700">Tudo aprovado!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendentes.map((p) => (
                <div key={p.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-4 border-purple-300 shadow-lg">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                      <p className="text-2xl font-black text-purple-800">{p.nome}</p>
                      <p className="text-xl text-purple-600 font-bold">FILIAL {p.filial}</p>
                      <p className="text-3xl font-black text-green-600 mt-3">
                        R$ {p.valor.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(p.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl px-10 py-6 shadow-xl"
                        onClick={() => aprovar(p)}
                      >
                        <Check className="w-8 h-8 mr-3" />
                        APROVAR
                      </Button>
                      <Button
                        size-size="lg"
                        variant="destructive"
                        className="font-bold text-xl px-10 py-6 shadow-xl"
                        onClick={() => rejeitar(p.id)}
                      >
                        <X className="w-8 h-8 mr-3" />
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
