// src/components/dashboard/Filiais.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Store, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FilialData {
  idfilial: number;
  filial: string;
  regional: string;
  // Meta Fiado
  total_vencido: number;
  total_meta_fiado: number;
  // Meta Desafio
  total_meta_desafio: number;
}

const Filiais = () => {
  const [filiais, setFiliais] = useState<FilialData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const { data: users } = await supabase
          .from("user_dashboard")
          .select("filial, vencido_atual, meta_mes, meta_desafio")
          .not("filial", "is", null)
          .gt("meta_mes", 0);

        if (!users || users.length === 0) {
          setFiliais([]);
          setLoading(false);
          return;
        }

        const filiaisIds = [...new Set(users.map(u => u.filial))];
        const { data: infoFiliais } = await supabase
          .from("filiais")
          .select("idfilial, filial, regional")
          .in("idfilial", filiaisIds);

        const agrupado = users.reduce((acc: any, u) => {
          const fil = u.filial!;
          if (!acc[fil]) {
            const info = infoFiliais?.find(f => f.idfilial === fil);
            acc[fil] = {
              idfilial: fil,
              filial: info?.filial || `Filial ${fil}`,
              regional: info?.regional || "Sem regional",
              total_vencido: 0,
              total_meta_fiado: 0,
              total_meta_desafio: 0,
            };
          }
          acc[fil].total_vencido += Number(u.vencido_atual || 0);
          acc[fil].total_meta_fiado += Number(u.meta_mes || 0);
          acc[fil].total_meta_desafio += Number(u.meta_desafio || 0);
          return acc;
        }, {});

        const lista = Object.values(agrupado) as FilialData[];

        // Arredonda
        lista.forEach(f => {
          f.total_vencido = Number(f.total_vencido.toFixed(2));
          f.total_meta_fiado = Number(f.total_meta_fiado.toFixed(2));
          f.total_meta_desafio = Number(f.total_meta_desafio.toFixed(2));
        });

        // Ordena por Meta Fiado (principal)
        lista.sort((a, b) => {
          const pctA = a.total_meta_fiado > 0 ? (a.total_vencido / a.total_meta_fiado) * 100 : 0;
          const pctB = b.total_meta_fiado > 0 ? (b.total_vencido / b.total_meta_fiado) * 100 : 0;
          return pctB - pctA;
        });

        setFiliais(lista);
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
    const interval = setInterval(fetchRanking, 30_000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (pct: number) => {
    if (pct >= 100) return "bg-green-500";
    if (pct >= 90) return "bg-yellow-500";
    if (pct >= 70) return "bg-orange-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <p className="text-muted-foreground mt-4">Carregando ranking...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <p className="text-muted-foreground mt-2">Meta Fiado (principal) • Meta Desafio (secundária)</p>
      </div>

      {filiais.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Store className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">
              Nenhuma filial com meta cadastrada ainda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filiais.map((f, i) => {
            const pctFiado = f.total_meta_fiado > 0 ? (f.total_vencido / f.total_meta_fiado) * 100 : 0;
            const pctDesafio = f.total_meta_desafio > 0 ? (f.total_vencido / f.total_meta_desafio) * 100 : 0;

            return (
              <Card
                key={f.idfilial}
                className={`shadow-xl hover:shadow-2xl transition-all border-l-8 ${
                  i === 0 ? "border-l-yellow-500" :
                  i === 1 ? "border-l-gray-400" :
                  i === 2 ? "border-l-orange-600" : "border-l-blue-500"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {i < 3 && (
                        <Trophy className={`h-10 w-10 ${
                          i === 0 ? "text-yellow-500" :
                          i === 1 ? "text-gray-400" : "text-orange-600"
                        }`} />
                      )}
                      <div>
                        <CardTitle className="text-lg leading-tight">
                          {f.filial}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{f.regional}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {String(f.idfilial).slice(-3)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Meta Fiado */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Target className="h-4 w-4" /> Meta Fiado
                      </span>
                      <span className="font-bold text-lg">{pctFiado.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(pctFiado, 100)} className="h-5" indicatorClassName={getColor(pctFiado)} />
                  </div>

                  {/* Meta Desafio */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Zap className="h-4 w-4 text-yellow-500" /> Meta Desafio
                      </span>
                      <span className="font-bold">{pctDesafio.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(pctDesafio, 100)} className="h-4" indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-500" />
                  </div>

                  <div className="text-xs space-y-1 pt-3 border-t">
                    <p>R$ {f.total_vencido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} recuperados</p>
                    <p>Meta Fiado: R$ {f.total_meta_fiado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Filiais;
