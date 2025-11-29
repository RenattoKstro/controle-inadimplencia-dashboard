// src/components/dashboard/Filiais.tsx
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Zap, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RankingFilial {
  idfilial: number;
  filial: string;
  regional: string;
  total_vencido: number;
  total_meta_fiado: number;
  total_meta_desafio: number;
  pct_fiado: number;
  pct_desafio: number;
  total_usuarios: number;
}

const Filiais = () => {
  const [ranking, setRanking] = useState<RankingFilial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from("vw_ranking_filiais")
        .select("*");

      if (!error && data) {
        setRanking(data);
      }
      setLoading(false);
    };

    fetchRanking();
    const interval = setInterval(fetchRanking, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center text-xl">Carregando Filiais %...</p>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <p className="text-muted-foreground mt-2">
          Ranking completo em tempo real • Atualizado a cada 30s
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="px-6 py-4 text-sm font-bold">#</th>
              <th className="px-6 py-4 text-sm font-bold">Filial</th>
              <th className="px-6 py-4 text-sm font-bold text-center">Meta Fiado</th>
              <th className="px-6 py-4 text-sm font-bold text-center">Meta Desafio</th>
            </tr>
          </thead>
          <tbody>
            {ranking.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-16 text-gray-500">
                  <Store className="h-20 w-20 mx-auto mb-4" />
                  <p className="text-xl">Nenhuma filial com meta ainda.</p>
                </td>
              </tr>
            ) : (
              ranking.map((f, i) => (
                <tr key={f.idfilial} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {i < 3 && (
                        <Trophy className={`h-6 w-6 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-orange-600"}`} />
                      )}
                      <span className="text-lg font-bold">{i + 1}º</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-semibold text-lg">{f.filial}</p>
                    <p className="text-sm text-gray-600">{f.regional}</p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>R$ {f.total_vencido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        <span className="font-bold text-lg">{f.pct_fiado}%</span>
                      </div>
                      <Progress value={f.pct_fiado} className="h-4" 
                        indicatorClassName={f.pct_fiado >= 100 ? "bg-green-500" : f.pct_fiado >= 90 ? "bg-yellow-500" : f.pct_fiado >= 70 ? "bg-orange-500" : "bg-red-500"} />
                      <p className="text-xs text-gray-600">Meta: R$ {f.total_meta_fiado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-lg">{f.pct_desafio}%</span>
                      </div>
                      <Progress value={f.pct_desafio} className="h-4" indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-500" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Filiais;
