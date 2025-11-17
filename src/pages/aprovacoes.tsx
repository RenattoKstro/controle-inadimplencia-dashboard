// src/pages/aprovacoes.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, RefreshCw, Trophy, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Pendente {
  id: string;
  nome: string;
  filial: string;
  valor: number;
  created_at: string;
}

export default function PainelAprovacoes() {
  const [pendentes, setPendentes] = useState<Pendente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const { toast } = useToast();

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
    const { error } = await supabase
      .from("apoiadores")
      .insert({
        nome: item.nome,
        filial: item.filial,
        valor: item.valor,
      });

    if (!error) {
      await supabase.from("apoiadores_pendentes").delete().eq("id", item.id);
      toast({
        title: "Aprovado!",
        description: `${item.nome} entrou no ranking!`,
      });
      buscarPendentes();
    } else {
      toast({ title: "Erro ao aprovar", variant: "destructive" });
    }
  };

  const rejeitar = async (id: string) => {
    await supabase.from("apoiadores_pendentes").delete().eq("id", id);
    toast({ title: "Rejeitado", variant: "destructive" });
    buscarPendentes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-purple-800 mb-4 flex items-center justify-center gap-4">
            <Heart className="fill-red-500 text-red-500" /> Painel de Aprovação
          </h1>
          <p className="text-xl text-purple-700">Você decide quem entra no ranking</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Pendentes: {pendentes.length}
            </h2>
            <Button onClick={buscarPendentes} size="lg" variant="outline" className="gap-3">
              <RefreshCw className={`w-6 h-6 ${carregando ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          {carregando ? (
            <p className="text-center py-20 text-2xl text-gray-500">Carregando doações...</p>
          ) : pendentes.length === 0 ? (
            <div className="text-center py-20">
              <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-6" />
              <p className="text-3xl font-black text-gray-700">Tudo aprovado!</p>
              <p className="text-xl text-gray-500">Nenhuma doação pendente</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendentes.map((p) => (
                <div
                  key={p.id}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border-4 border-purple-300 shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                      <p className="text-4xl font-black text-purple-800">{p.nome}</p>
                      <p className="text-2xl text-purple-600 font-bold">{p.filial}</p>
                      <p className="text-5xl font-black text-green-600 mt-3">
                        R$ {p.valor.toFixed(0)}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {new Date(p.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white font-black text-2xl px-12 py-8 shadow-2xl"
                        onClick={() => aprovar(p)}
                      >
                        <Check className="w-12 h-12 mr-3" />
                        APROVAR
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        className="font-black text-2xl px-12 py-8 shadow-2xl"
                        onClick={() => rejeitar(p.id)}
                      >
                        <X className="w-12 h-12 mr-3" />
                        REJEITAR
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <p className="text-purple-700 font-bold text-lg">
            Feito por @renato_alme1da
          </p>
        </div>
      </div>
    </div>
  );
}
