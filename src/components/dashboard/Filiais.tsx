// src/components/dashboard/Filiais.tsx
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

const Filiais = () => {
  const [ranking, setRanking] = useState<RankingFilial[]>([]);
  const [regionais, setRegionais] = useState<string[]>([]);
  const [filtroRegional, setFiltroRegional] = useState<string>("todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from("vw_ranking_filiais")
        .select("*");

      if (!error && data) {
        const lista = data as RankingFilial[];
        const regs = [...new Set(lista.map(f => f.regional || "Sem regional"))].sort();
        setRegionais(regs);
        setRanking(lista);
      }
      setLoading(false);
    };

    fetchRanking();
    const interval = setInterval(fetchRanking, 30_000);
    return () => clearInterval(interval);
  }, []);

  const dadosFiltrados = filtroRegional === "todas"
    ? ranking
    : ranking.filter(f => (f.regional || "Sem regional") === filtroRegional);

  if (loading) return <p className="text-center py-20 text-xl">Carregando Filiais %...</p>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <p className="text-muted-foreground mt-2">
          {dadosFiltrados.length} filiais • Atualizado a cada 30s
        </p>
      </div>

      {/* FILTRO POR REGIONAL */}
      <div className="max-w-xs mx-auto">
        <Select value={filtroRegional} onValueChange={setFiltroRegional}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as regionais" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as regionais</SelectItem>
            {regionais.map(reg => (
              <SelectItem key={reg} value={reg}>{reg}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* LISTA ULTRA COMPACTA */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Filial</th>
              <th className="px-4 py-2 text-center">Meta Fiado</th>
              <th className="px-4 py-2 text-center">Meta Desafio</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-500">
                  <Store className="h-16 w-16 mx-auto mb-3" />
                  <p>Nenhuma filial nesta regional.</p>
                </td>
              </tr>
            ) : (
              dadosFiltrados.map((f, i) => {
                // Valor restante pra bater 100%
                const restanteFiado = f.total_meta_fiado > f.total_vencido
                  ? f.total_meta_fiado - f.total_vencido
                  : 0;

                const restanteDesafio = f.total_meta_desafio > f.total_vencido
                  ? f.total_meta_desafio - f.total_vencido
                  : 0;

                return (
                  <tr key={f.idfilial} className="border-b hover:bg-gray-50 transition-colors">
                    {/* Posição */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {i < 3 && (
                          <Trophy className={`h-5 w-5 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-orange-600"}`} />
                        )}
                        <span className="font-bold">{i + 1}</span>
                      </div>
                    </td>

                    {/* Filial + Regional */}
                    <td className="px-4 py-3">
                      <p className="font-medium">{f.filial}</p>
                      <p className="text-xs text-gray-600">{f.regional}</p>
                    </td>

                    {/* Meta Fiado */}
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <p className="font-bold text-lg">{f.pct_fiado.toFixed(2)}%</p>
                        <Progress value={f.pct_fiado} className="h-3"
                          indicatorClassName={f.pct_fiado >= 100 ? "bg-green-500" : f.pct_fiado >= 95 ? "bg-yellow-500" : "bg-red-500"} />
                        {restanteFiado > 0 && (
                          <p className="text-xs text-red-600 font-medium">
                            Faltam R$ {restanteFiado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Meta Desafio */}
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <p className="font-bold text-lg flex items-center justify-center gap-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          {f.pct_desafio.toFixed(2)}%
                        </p>
                        <Progress value={f.pct_desafio} className="h-3" indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-500" />
                        {restanteDesafio > 0 && (
                          <p className="text-xs text-orange-600 font-medium">
                            Faltam R$ {restanteDesafio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Filiais;
