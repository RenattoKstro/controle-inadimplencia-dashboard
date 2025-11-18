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

  // Verifica se é o Renato
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
    alert("Aprovado!");
  };

  const rejeitar = async (id: string) => {
    await supabase.from("apoiadores_pendentes").delete().eq("id", id);
    fetchPendentes();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="text-center text-white">
          <h1 className="text-4xl font-black mb-4">Acesso Restrito</h1>
          <p className="text-xl">Faça login com rks7ro@gmail.com</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-black text-purple-800 text-center mb-10">
          Painel de Aprovação
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-300">
          <div className="flex justify-between mb-8">
            <h2 className="text-3xl font-bold">Pendentes: {pendentes.length}</h2>
            <Button onClick={fetchPendentes}>
              <RefreshCw className={`w-6 h-6 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {pendentes.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-6" />
              <p className="text-4xl font-black text-gray-700">Tudo aprovado!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendentes.map(p => (
                <div key={p.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border-4 border-purple-300">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <p className="text-4xl font-black text-purple-800">{p.nome}</p>
                      <p className="text-2xl text-purple-600">{p.filial}</p>
                      <p className="text-5xl font-black text-green-600 mt-4">
                        R$ {p.valor.toFixed(0)}
                      </p>
                    </div>
                    <div className="flex gap-6">
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white font-black text-2xl px-12 py-8"
                        onClick={() => aprovar(p)}
                      >
                        <Check className="w-10 h-10 mr-4" />
                        APROVAR
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        className="text-2xl font-black px-12 py-8"
                        onClick={() => rejeitar(p.id)}
                      >
                        <X className="w-10 h-10 mr-4" />
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
