// src/components/dashboard/Filiais.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Store, Target, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FilialData {
  idfilial: number;
  filial: string;
  regional: string;
  total_vencido: number;
  total_meta: number;
  usuarios: number;
}

const Filiais = () => {
  const [ranking, setRanking] = useState<FilialData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        // 1. Pega todos os usuários com filial e meta
        const { data: users } = await supabase
          .from("user_dashboard")
          .select("filial, vencido_atual, meta_mes")
          .not("filial", "is", null)
          .gt("meta_mes", 0);

        if (!users || users.length === 0) {
          setRanking([]);
          setLoading(false);
          return;
        }

        // 2. Pega os nomes e regionais das filiais
        const filiaisIds = [...new Set(users.map(u => u.filial))];
        const { data: filiais } = await supabase
          .from("filiais")
          .select("idfilial, filial, regional")
          .in("idfilial", filiaisIds);

        // 3. Agrupa e calcula
        const agrupado = users.reduce((acc: any, user) => {
          const fil = user.filial!;
          if (!acc[fil]) {
            const info = filiais?.find(f => f.idfilial === fil);
            acc[fil] = {
              idfilial: fil,
              filial: info?.filial || `Filial ${fil}`,
              regional: info?.regional || "Sem regional",
              total_vencido: 0,
              total_meta: 0,
              usuarios: 0
            };
          }
          acc[fil].total_vencido += Number(user.vencido_atual || 0);
          acc[fil].total_meta += Number(user.meta_mes || 0);
          acc[fil].usuarios += 1;
          return acc;
        }, {});

        const lista = Object.values(agrupado) as FilialData[];

        // Arredonda e ordena
        lista.forEach(f => {
          f.total_vencido = Number(f.total_vencido.toFixed(2));
          f.total_meta = Number(f.total_meta.toFixed(2));
        });

        lista.sort((a, b) => {
          const pctA = a.total_meta > 0 ? (a.total_vencido / a.total_meta) * 100 : 0;
          const pctB = b.total_meta > 0 ? (b.total_vencido / b.total_meta) * 100 : 0;
          return pctB - pctA;
        });

        setRanking(lista);
      } catch (err) {
        console.error("Erro no ranking:", err);
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
    if (pct >= 80) return "bg-yellow-500";
    if (pct >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <p className="text-muted-foreground mt-2">Ranking em tempo real • Atualizado a cada 30s</p>
      </div>

      {ranking.length === 0 ? (
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
          {ranking.map((f, index) => {
            const percentual = f.total_meta > 0 ? (f.total_vencido / f.total_meta) * 100 : 0;

            return (
              <Card
                key={f.idfilial}
                className={`shadow-xl hover:shadow-2xl transition-all border-l-8 ${
                  index === 0 ? "border-l-yellow-500" :
                  index === 1 ? "border-l-gray-400" :
                  index === 2 ? "border-l-orange-600" : "border-l-blue-500"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {index < 3 && (
                        <Trophy className={`h-10 w-10 ${
                          index === 0 ? "text-yellow-500" :
                          index === 1 ? "text-gray-400" : "text-orange-600"
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

                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium flex items-center gap-1">
                        <Target className="h-4 w-4" /> Meta Realizada
                      </span>
                      <span className="font-bold text-xl">{percentual.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(percentual, 100)} 
                      className="h-5" 
                      indicatorClassName={getColor(percentual)}
                    />
                  </div>

                  <div className="text-xs space-y-1 pt-3 border-t">
                    <p className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Colaboradores</span>
                      <strong>{f.usuarios}</strong>
                    </p>
                    <p>R$ {f.total_vencido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} recuperados</p>
                    <p>Meta: R$ {f.total_meta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
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
