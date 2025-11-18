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
  const [loading, setLoading] = useState(true);

  // Verifica se é você
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email === "rks7ro@gmail.com") {
        setUser(data.user);
      } else {
        window.location.href = "/";
      }
    };
    checkUser();
  }, []);

  const fetchPendentes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("apoiadores_pendentes")
      .select("*")
      .order("created_at", { ascending: false });
    setPendentes(data || []);
    setLoading(false);
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

 8000};

  // Enquanto carrega o usuário
  if (user === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-3xl font-bold">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Se não for você
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-5xl font-black mb-6">Acesso Negado</h1>
          <p className="text-2xl">Apenas rks7ro@gmail.com</p>
        </div>
      </div>
    );
  }

  // PAINEL DO RENATO
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-6xl font-black text-purple-800 text-center mb-12">
          Painel de Aprovação
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-300">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-bold text-gray-800">
              Pendentes: {pendentes.length}
            </h2>
            <Button onClick={fetchPendentes} size="lg" className="gap-3">
              <RefreshCw className={`w-8 h-8 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {loading ? (
            <p className="text-center py-20 text-3xl text-gray-500">Carregando...</p>
          ) : pendentes.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-40 h-40 text-yellow-500 mx-auto mb-8" />
              <p className="text-5xl font-black text-gray-700">Tudo aprovado!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {pendentes.map((p) => (
                <div key={p.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-50 rounded-3xl p-10 border-4 border-purple-300 shadow-xl">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                      <p className="text-5xl font-black text-purple-800">{p.nome}</p>
                      <p className="text-3xl text-purple-600 font-bold">{p.filial}</p>
                      <p className="text-6xl font-black text-green-600 mt-4">
                        R$ {p.valor.toFixed(0)}
                      </p>
                      <p className="text-lg text-gray-600 mt-3">
                        {new Date(p.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <div className="flex gap-6">
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white font-black text-3xl px-16 py-10 shadow-2xl"
                        onClick={() => aprovar(p)}
                      >
                        <Check className="w-12 h-12 mr-4" />
                        APROVAR
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        className="font-black text-3xl px-16 py-10 shadow-2xl"
                        onClick={() => rejeitar(p.id)}
                      >
                        <X className="w-12 h-12 mr-4" />
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
