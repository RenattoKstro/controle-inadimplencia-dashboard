// src/pages/aprovacoes.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, RefreshCw, Edit2, Trash2, Save, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Pendente {
  id: string;
  nome: string;
  filial: string;
  valor: number;
  created_at: string;
}

interface Editando {
  id: string;
  nome: string;
  filial: string;
  valor: number;
}

export default function AprovacoesAdmin() {
  const [user, setUser] = useState<any>(null);
  const [pendentes, setPendentes] = useState<Pendente[]>([]);
  const [apoiadores, setApoiadores] = useState<Pendente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<Editando | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email === "rks7ro@gmail.com") {
        setUser(data.user);
      } else {
        window.location.href = "/";
      }
    });
  }, []);

  const fetchAll = async () => {
    setCarregando(true);
    const [pend, apo] = await Promise.all([
      supabase.from("apoiadores_pendentes").select("*").order("created_at", { ascending: false }),
      supabase.from("apoiadores").select("*").order("valor", { ascending: false })
    ]);
    setPendentes(pend.data || []);
    setApoiadores(apo.data || []);
    setCarregando(false);
  };

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const aprovar = async (item: Pendente) => {
    await supabase.from("apoiadores").insert(item);
    await supabase.from("apoiadores_pendentes").delete().eq("id", item.id);
    fetchAll();
    alert(`${item.nome} aprovado e entrou no ranking!`);
  };

  const rejeitar = async (id: string) => {
    if (confirm("Rejeitar essa doação?")) {
      await supabase.from("apoiadores_pendentes").delete().eq("id", id);
      fetchAll();
    }
  };

  const editar = (item: any) => {
    setEditando({
      id: item.id,
      nome: item.nome,
      filial: item.filial,
      valor: item.valor
    });
  };

  const salvarEdicao = async () => {
    if (!editando) return;
    await supabase.from("apoiadores").update({
      nome: editando.nome,
      filial: editando.filial,
      valor: editando.valor
    }).eq("id", editando.id);
    setEditando(null);
    fetchAll();
    alert("Editado com sucesso!");
  };

  const excluir = async (id: string, nome: string) => {
    if (confirm(`Excluir ${nome} do ranking?`)) {
      await supabase.from("apoiadores").delete().eq("id", id);
      fetchAll();
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-6xl font-black text-purple-800 text-center mb-12">
          Painel de Gerenciamento
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* PENDENTES */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-orange-400">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-orange-700">
                Pendentes ({pendentes.length})
              </h2>
              <Button onClick={fetchAll} size="lg">
                <RefreshCw className={`w-8 h-8 mr-3 ${carregando ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>

            {pendentes.length === 0 ? (
              <p className="text-center py-20 text-3xl text-gray-500">Nenhuma doação pendente</p>
            ) : (
              <div className="space-y-6">
                {pendentes.map(p => (
                  <div key={p.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-3xl p-8 border-4 border-orange-300">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      <div>
                        <p className="text-5xl font-black text-orange-800">{p.nome}</p>
                        <p className="text-3xl text-orange-600 font-bold">FILIAL {p.filial}</p>
                        <p className="text-5xl font-black text-green-600 mt-4">
                          R$ {p.valor.toFixed(0)}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <Button
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white font-black text-2xl px-12 py-8"
                          onClick={() => aprovar(p)}
                        >
                          <Check className="w-12 h-12 mr-4" />
                          APROVAR
                        </Button>
                        <Button
                          size="lg"
                          variant="destructive"
                          className="font-black text-2xl px-12 py-8"
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

          {/* RANKING (COM EDIÇÃO E EXCLUSÃO) */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-400">
            <h2 className="text-4xl font-bold text-purple-700 mb-8 text-center">
              Ranking Atual ({apoiadores.length})
            </h2>

            {apoiadores.length === 0 ? (
              <p className="text-center py-20 text-3xl text-gray-500">Ranking vazio</p>
            ) : (
              <div className="space-y-6">
                {apoiadores.map((a, i) => (
                  <div key={a.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border-4 border-purple-300">
                    {editando?.id === a.id ? (
                      <div className="space-y-4">
                        <Input value={editando.nome} onChange={e => setEditando({ ...editando, nome: e.target.value.toUpperCase().slice(0, 14) })} className="text-3xl font-black text-center" />
                        <Input value={editando.filial} onChange={e => setEditando({ ...editando, filial: e.target.value.replace(/\D/g, "") })} className="text-2xl text-center" />
                        <Input value={editando.valor} onChange={e => setEditando({ ...editando, valor: Number(e.target.value) })} className="text-4xl font-black text-green-600 text-center" />
                        <div className="flex gap-4 justify-center">
                          <Button onClick={salvarEdicao} className="bg-green-600 text-white">
                            <Save className="w-6 h-6 mr-2" /> Salvar
                          </Button>
                          <Button variant="outline" onClick={() => setEditando(null)}>
                            <XCircle className="w-6 h-6 mr-2" /> Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                          <p className="text-5xl font-black text-purple-800">{a.nome}</p>
                          <p className="text-3xl text-purple-600 font-bold">FILIAL {a.filial}</p>
                          <p className="text-5xl font-black text-green-600 mt-4">
                            R$ {a.valor.toFixed(0)}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <Button size="icon" variant="outline" onClick={() => editar(a)}>
                            <Edit2 className="w-8 h-8" />
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => excluir(a.id, a.nome)}>
                            <Trash2 className="w-8 h-8" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
