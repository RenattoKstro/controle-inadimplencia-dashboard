// src/components/RankingApoiadores.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Apoiador {
  id: string;
  nome: string;
  filial: string;
  valor: number;
}

export default function RankingApoiadores() {
  const [apoiadores, setApoiadores] = useState<Apoiador[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("apoiadores")
      .select("id, nome, filial, valor")
      .order("valor", { ascending: false })
      .limit(10);
    setApoiadores(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRanking();
    const interval = setInterval(fetchRanking, 30000); // atualiza a cada 30s
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
      {/* BOTÃO ATUALIZAR NO TOPO */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-purple-800">
          Ranking de Apoiadores
        </h2>
        <Button onClick={fetchRanking} size="sm" className="gap-2">
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Carregando...</p>
      ) : apoiadores.length === 0 ? (
        <p className="text-center py-8 text-purple-600 font-medium">
          Seja o primeiro a apoiar!
        </p>
      ) : (
        <div className="space-y-4">
          {apoiadores.map((a, i) => (
            <div
              key={a.id}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                i < 3 ? "bg-gradient-to-r from-yellow-50 to-pink-50 border-purple-400" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                {medal(i)}
                <div>
                  <p className="font-bold text-lg text-gray-800">{a.nome}</p>
                  <p className="text-sm text-purple-600">{a.filial}</p>
                </div>
              </div>
              <p className="font-black text-green-600 text-xl">
                R$ {a.valor.toFixed(0)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
