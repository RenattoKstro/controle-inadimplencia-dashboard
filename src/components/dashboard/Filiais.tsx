// src/components/dashboard/Filiais.tsx
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  const [regionais, setRegionais] = useState<string[]>([]);
  const [filtroRegional, setFiltroRegional] = useState<string>("todas");
  const [ocultarZeradas, setOcultarZeradas] = useState(true); // ← NOVO FILTRO
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

  // APLICA OS FILTROS
  let dadosFiltrados = ranking;

  // Filtro por regional
  if (filtroRegional !== "todas") {
    dadosFiltrados = dadosFiltrados.filter(f => (f.regional || "Sem regional") === filtroRegional);
  }

  // NOVO: Ocultar filiais zeradas (sem meta ou sem vencido)
  if (ocultarZeradas) {
    dadosFiltrados = dadosFiltrados.filter(f => 
      f.total_meta_fiado > 0 || f.total_meta_desafio > 0
    );
  }

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

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {/* Filtro por Regional */}
        <div className="w-full max-w-xs">
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

        {/* NOVO: Ocultar filiais zeradas */}
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow border">
          <Switch
            id="ocultar-zeradas"
            checked={ocultarZeradas}
            onCheckedChange={setOcultarZeradas}
          />
          <Label htmlFor="ocultar-zeradas" className="cursor-pointer font-medium">
            Ocultar filiais zeradas
          </Label>
        </div>
      </div>

      {/* LISTA COMPACTA */}
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
                <td colSpan={4} className="text-center py-16 text-gray-500">
                  <Store className="h-20 w-20 mx-auto mb-4" />
                  <p className="text-xl">
                    {ocultarZeradas 
                      ? "Nenhuma filial com meta ativa." 
                      : "Nenhuma filial cadastrada."}
                  </p>
                </td>
              </tr>
            ) : (
              dadosFiltrados.map((f, i) => (
                <tr key={f.idfilial} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {i < 3 && (
                        <Trophy className={`h-5 w-5 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-orange-600"}`} />
                      )}
                      <span className="font-bold">{i + 1}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium">{f.filial}</p>
                    <p className="text-xs text-gray-600">{f.regional}</p>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="space-y-1">
                      <p className="font-bold text-lg">{f.pct_fiado.toFixed(2)}%</p>
                      <Progress value={f.pct_fiado} className="h-3"
                        indicatorClassName={f.pct_fiado >= 100 ? "bg-green-500" : f.pct_fiado >= 95 ? "bg-yellow-500" : "bg-red-500"} />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="space-y-1">
                      <p className="font-bold text-lg flex items-center justify-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        {f.pct_desafio.toFixed(2)}%
                      </p>
                      <Progress value={f.pct_desafio} className="h-3" indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-500" />
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
