// src/pages/aprovacoes.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, RefreshCw, Edit2, Trash2, Save, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Item {
  id: string;
  nome: string;
  filial: string;
  valor: number;
  created_at: string;
  mostrar_valor?: boolean;
}

export default function AprovacoesAdmin() {
  const [user, setUser] = useState<any>(null);
  const [pendentes, setPendentes] = useState<Item[]>([]);
  const [apoiadores, setApoiadores] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nome: "", filial: "", valor: 0 });

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
    setLoading(true);
    const [pend, apo] = await Promise.all([
      supabase.from("apoiadores_pendentes").select("*").order("created_at", { ascending: false }),
      supabase.from("apoiadores").select("*").order("valor", { ascending: false })
    ]);
    setPendentes(pend.data || []);
    setApoiadores(apo.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const aprovar = async (item: Item) => {
    await supabase.from("apoiadores").insert({
      nome: item.nome,
      filial: item.filial,
      valor: item.valor,
      mostrar_valor: item.mostrar_valor,
    });
    await supabase.from("apoiadores_pendentes").delete().eq("id", item.id);
    fetchAll();
    alert(`${item.nome} entrou no ranking!`);
  };

  const rejeitar = async (id: string) => {
    if (confirm("Rejeitar doação?")) {
      await supabase.from("apoiadores_pendentes").delete().eq("id", id);
      fetchAll();
    }
  };

  const iniciarEdicao = (item: Item) => {
    setEditando(item.id);
    setEditForm({ nome: item.nome, filial: item.filial, valor: item.valor });
  };

  const salvarEdicao = async () => {
    if (!editando) return;
    await supabase.from("apoiadores").update(editForm).eq("id", editando);
    setEditando(null);
    fetchAll();
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
        <h1 className="text-4xl font-black text-purple-800 text-center mb-10">
          Painel de Gerenciamento
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PENDENTES */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-orange-400">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-orange-700">
                Pendentes ({pendentes.length})
              </h2>
              <Button onClick={fetchAll} size="sm" className="gap-2">
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>

            {pendentes.length === 0 ? (
              <p className="text-center py-16 text-gray-500">Nenhuma doação pendente</p>
            ) : (
              <div className="space-y-4">
                {pendentes.map(p => (
                  <div key={p.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-5 border-2 border-orange-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <p className="text-xl font-black text-orange-800">{p.nome}</p>
                        <p className="text-lg text-orange-600 font-bold">FILIAL {p.filial}</p>
                        <p className="text-2xl font-black text-green-600 mt-1">
                          R$ {p.valor.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          {new Date(p.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white font-bold flex-1 sm:flex-initial"
                          onClick={() => aprovar(p)}
                        >
                          <Check className="w-5 h-5 mr-1" /> APROVAR
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="font-bold flex-1 sm:flex-initial"
                          onClick={() => rejeitar(p.id)}
                        >
                          <X className="w-5 h-5 mr-1" /> REJEITAR
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RANKING ATUAL */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-purple-400">
            <h2 className="text-xl font-bold text-purple-700 text-center mb-6">
              Ranking Atual ({apoiadores.length})
            </h2>

            {apoiadores.length === 0 ? (
              <p className="text-center py-16 text-gray-500">Ranking vazio</p>
            ) : (
              <div className="space-y-4">
                {apoiadores.map(a => (
                  <div key={a.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-300">
                    {editando === a.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editForm.nome}
                          onChange={e => setEditForm({ ...editForm, nome: e.target.value.toUpperCase().slice(0, 14) })}
                          className="text-xl font-black text-center"
                        />
                        <Input
                          value={editForm.filial}
                          onChange={e => setEditForm({ ...editForm, filial: e.target.value.replace(/\D/g, "") })}
                          className="text-lg text-center"
                        />
                        <Input
                          value={editForm.valor}
                          onChange={e => setEditForm({ ...editForm, valor: Number(e.target.value) || 0 })}
                          type="number"
                          className="text-2xl font-black text-green-600 text-center"
                        />
                        <div className="flex gap-3 justify-center">
                          <Button onClick={salvarEdicao} size="sm" className="bg-green-600 text-white">
                            <Save className="w-5 h-5 mr-1" /> Salvar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditando(null)}>
                            <XCircle className="w-5 h-5 mr-1" /> Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <p className="text-xl font-black text-purple-800">{a.nome}</p>
                          <p className="text-lg text-purple-600 font-bold">FILIAL {a.filial}</p>
                          <p className="text-2xl font-black text-green-600 mt-1">
                            R$ {a.valor.toFixed(0)}
                          </p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <Button size="icon" variant="outline" onClick={() => iniciarEdicao(a)}>
                            <Edit2 className="w-5 h-5" />
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => excluir(a.id, a.nome)}>
                            <Trash2 className="w-5 h-5" />
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
