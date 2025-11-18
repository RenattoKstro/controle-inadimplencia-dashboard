// src/pages/aprovacoes.tsx
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const supabase = createClientComponentClient();

export default function AprovacoesAdmin() {
  const [user, setUser] = useState<any>(null);
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email === "rks7ro@gmail.com") {
        setUser(data.user);
      } else {
        window.location.href = "/";
      }
    });
  }, []);

  useEffect(() => {
    if (user) {
      const fetchPendentes = async () => {
        const { data } = await supabase
          .from("apoiadores_pendentes")
          .select("*")
          .order("created_at", { ascending: false });
        setPendentes(data || []);
        setLoading(false);
      };
      fetchPendentes();
    }
  }, [user]);

  const aprovar = async (id: string) => {
    const item = pendentes.find(p => p.id === id);
    if (item) {
      await supabase.from("apoiadores").insert(item);
      await supabase.from("apoiadores_pendentes").delete().eq("id", id);
      setPendentes(pendentes.filter(p => p.id !== id));
      alert(`${item.nome} aprovado!`);
    }
  };

  const rejeitar = async (id: string) => {
    await supabase.from("apoiadores_pendentes").delete().eq("id", id);
    setPendentes(pendentes.filter(p => p.id !== id));
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><p>Carregando...</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-purple-800 text-center mb-10">Painel do Renato</h1>

        <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-300">
          <div className="flex justify-between mb-8">
            <h2 className="text-3xl font-bold">Pendentes: {pendentes.length}</h2>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-6 h-6 mr-2" /> Atualizar
            </Button>
          </div>

          {loading ? (
            <p className="text-center py-20 text-2xl">Carregando...</p>
          ) : pendentes.length === 0 ? (
            <p className="text-center py-20 text-3xl font-bold">Tudo aprovado!</p>
          ) : (
            <div className="space-y-6">
              {pendentes.map(p => (
                <div key={p.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border-4 border-purple-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-4xl font-black text-purple-800">{p.nome}</p>
                      <p className="text-2xl text-purple-600">{p.filial}</p>
                      <p className="text-5xl font-black text-green-600">R$ {p.valor.toFixed(0)}</p>
                    </div>
                    <div className="flex gap-6">
                      <Button size="lg" className="bg-green-600 text-3xl px-12 py-8" onClick={() => aprovar(p.id)}>
                        <Check className="w-12 h-12 mr-4" /> APROVAR
                      </Button>
                      <Button size="lg" variant="destructive" className="text-3xl px-12 py-8" onClick={() => rejeitar(p.id)}>
                        <X className="w-12 h-12 mr-4" /> REJEITAR
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
