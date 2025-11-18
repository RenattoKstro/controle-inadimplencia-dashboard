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
    // Verifica se é você
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === "rks7ro@gmail.com") {
        setUser(user);
      else window.location.href = "/";
    });
  }, []);

  const buscar = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from("apoiadores_pendentes")
      .select("*")
      .order("created_at", { ascending: false });
    setPendentes(data || []);
    setCarregando(false);
  };

  useEffect(() => {
    if (user) buscar();
  }, [user]);

  const aprovar = async (item: Pendente) => {
    await supabase.from("apoiadores").insert(item);
    await supabase.from("apoiadores_pendentes").delete().eq("id", item.id);
    buscar();
    alert(`${item.nome} entrou no ranking!`);
  };

  const rejeitar = async (id: string) => {
    await supabase.from("apoiadores_pendentes").delete().eq("id", id);
    buscar();
  };

  if (!user) return null; // tela branca até carregar

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-black text-purple-800 text-center mb-10">
          Painel de Aprovação
        </h1>

        <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-300">
          <div className="flex justify-between mb-8">
            <h2 className="text-3xl font-bold">Pendentes: {pendentes.length}</h2>
            <Button onClick={buscar}>
              <RefreshCw className={`w-6 h-6 mr-2 ${carregando ? "animate-spin" : ""} />
              Atualizar
            </Button>
          </div>

          {carregando ? (
            <p className="text-center py-20 text-2xl text-gray-500">Carregando...</p>
          ) : pendentes.length === 0 ? (
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
