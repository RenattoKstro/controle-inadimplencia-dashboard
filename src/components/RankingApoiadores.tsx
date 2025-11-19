// src/components/RankingApoiadores.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, Heart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AvisoApoio from "./AvisoApoio";

interface Apoiador {
  id: string;
  nome: string;
  filial: string;
  valor: number;
  mostrar_valor?: boolean;
}

export default function RankingApoiadores() {
  const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("apoiadores")
      .select("id, nome, filial, valor, mostrar_valor")
      .order("valor", { ascending: false })
      .limit(10);
    setApoiadores(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRanking();
    const interval = setInterval(fetchRanking, 30000);
    return () => clearInterval(interval);
  }, []);

  const medal = (i: number) => {
    if (i === 0) return <Trophy className="w-7 h-7 text-yellow-500" />;
    if (i === 1) return <Medal className="w-7 h-7 text-gray-400" />;
    if (i === 2) return <Award className="w-7 h-7 text-orange-600" />;
    return <span className="w-7 text-center font-bold text-purple-600">{i + 1}</span>;
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-purple-300">
      {/* BOTÃO APOIAR + ATUALIZAR */}
      <div className="flex justify-between items-center mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold shadow-xl">
              <Heart className="w-5 h-5 fill-white mr-2" />
              Apoiar o Projeto
            </Button>
          </DialogTrigger>
          {/* MODAL GRANDE PARA O FORMULÁRIO COMPLETO */}
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 bg-transparent border-0">
            <AvisoApoio />
          </DialogContent>
        </Dialog>

        <Button
          size="icon"
          variant="outline"
          onClick={fetchRanking}
          className="rounded-full shadow-md hover:shadow-xl transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <h2 className="text-2xl font-black text-purple-800 text-center mb-4">
        Ranking de Apoiadores
      </h2>

      {loading ? (
        <p className="text-center py-4 text-gray-500">Carregando...</p>
      ) : apoiadores.length === 0 ? (
        <p className="text-center text-purple-600 font-medium py-8">
          Seja o primeiro a apoiar!
        </p>
      ) : (
        <div className="space-y-3">
          {apoiadores.map((a, i) => (
            <div
              key={a.id}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                i < 3
                  ? "bg-gradient-to-r from-yellow-50 to-pink-50 border-purple-400"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {medal(i)}
                <div>
                  <p className="font-bold text-sm text-gray-800">{a.nome}</p>
                  <p className="text-xs text-purple-600">FILIAL {a.filial}</p>
                </div>
              </div>
              <p className="font-black text-green-600">
                R: {a.mostrar_valor === false ? "***" : `R$ ${a.valor.toFixed(0)}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
