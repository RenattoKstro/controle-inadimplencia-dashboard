// src/components/dashboard/Filiais.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Target, Trophy, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FilialRanking {
  filial: number;
  nome_filial: string;
  cidade: string | null;
  total_meta_mes: number;
  total_vencido_atual: number;
  total_meta_desafio: number;
  pct_meta_fiado: number;
  pct_meta_desafio: number;
  total_usuarios: number;
}

const Filiais = () => {
  const [filiais, setFiliais] = useState<FilialRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("vw_ranking_filiais")
          .select("*")
          .order("pct_meta_fiado", { ascending: false });

        if (error) throw error;
        setFiliais(data || []);
      } catch (err) {
        console.error("Erro ao carregar ranking de filiais:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
    const interval = setInterval(fetchRanking, 45_000); // atualiza a cada 45s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-8 w-40" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Store className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Ranking de Filiais
        </h2>
      </div>

      {filiais.length === 0 ? (
        <Card><CardContent className="text-center py-12 text-muted-foreground">
          Nenhuma filial com dados no momento.
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filiais.map((f, index) => (
            <Card
              key={f.filial}
              className={`shadow-lg hover:shadow-xl transition-all border-l-4 ${
                f.pct_meta_fiado >= 100 ? "border-l-green-500" :
                f.pct_meta_fiado >= 80 ? "border-l-yellow-500" :
                f.pct_meta_fiado >= 50 ? "border-l-orange-500" : "border-l-red-500"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg leading-tight">{f.nome_filial}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {f.cidade && `${f.cidade} • `}{String(f.filial).padStart(3, "0")}
                    </p>
                  </div>
                  {index === 0 && <Trophy className="h-8 w-8 text-yellow-500" />}
                  {index === 1 && <Trophy className="h-8 w-8 text-gray-400" />}
                  {index === 2 && <Trophy className="h-8 w-8 text-orange-600" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1 font-medium"><Target className="h-4 w-4" /> Meta Fiado</span>
                    <span className="font-bold text-lg">{f.pct_meta_fiado.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(f.pct_meta_fiado, 100)} className="h-3" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1 font-medium"><Trophy className="h-4 w-4 text-yellow-600" /> Meta Desafio</span>
                    <span className="font-bold">{f.pct_meta_desafio.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(f.pct_meta_desafio, 100)} className="h-3" />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {f.total_usuarios} usuário{f.total_usuarios > 1 ? "s" : ""}</span>
                  <span>R$ {f.total_vencido_atual.toLocaleString("pt-BR", {minimumFractionDigits: 0})} recuperados</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Filiais;
