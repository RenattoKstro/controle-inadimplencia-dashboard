import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Target, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FilialData {
  id: string;
  filial: number;
  nome_filial?: string;
  meta_mes: number;
  vencido_atual: number;
  meta_desafio: number;
  // campos opcionais para nome bonito da filial (se tiver no seu banco)
}

const Filiais = () => {
  const [filiais, setFiliais] = useState<FilialData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiliais = async () => {
      try {
        setLoading(true);

        // Busca todos os usuários que têm filial definida
        const { data, error } = await supabase
          .from("users") // ajuste se sua tabela tiver outro nome
          .select("filial, meta_mes, vencido_atual, meta_desafio, nome_filial")
          .not("filial", "is", null)
          .gt("meta_mes", 0); // evita divisão por zero

        if (error) throw error;

        // Agrupa por filial e soma os valores (caso tenha mais de um usuário por filial)
        const agrupado = data.reduce((acc: any, user: any) => {
          const fil = user.filial.toString();

          if (!acc[fil]) {
            acc[fil] = {
              id: fil,
              filial: user.filial,
              nome_filial: user.nome_filial || `Filial ${String(user.filial).padStart(3, "0")}`,
              meta_mes: 0,
              vencido_atual: 0,
              meta_desafio: 0,
            };
          }

          acc[fil].meta_mes += user.meta_mes || 0;
          acc[fil].vencido_atual += user.vencido_atual || 0;
          acc[fil].meta_desafio += user.meta_desafio || 0;

          return acc;
        }, {});

        const listaFiliais = Object.values(agrupado) as FilialData[];

        // Ordena por % da Meta Fiado (maior primeiro)
        listaFiliais.sort((a, b) => {
          const pctA = a.meta_mes > 0 ? (a.vencido_atual / a.meta_mes) * 100 : 0;
          const pctB = b.meta_mes > 0 ? (b.vencido_atual / b.meta_mes) * 100 : 0;
          return pctB - pctA;
        });

        setFiliais(listaFiliais);
      } catch (err) {
        console.error("Erro ao carregar filiais:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiliais();

    // Atualiza a cada 30 segundos (opcional)
    const interval = setInterval(fetchFiliais, 30_000);
    return () => clearInterval(interval);
  }, []);

  const getProgressColor = (percentual: number) => {
    if (percentual >= 100) return "bg-green-500";
    if (percentual >= 80) return "bg-yellow-500";
    if (percentual >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
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
          Filiais %
        </h2>
      </div>

      {filiais.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12 text-muted-foreground">
            Nenhuma filial com dados ainda.
            <br />
            Os dados aparecerão assim que os usuários preencherem suas metas.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filiais.map((filial) => {
            const pctFiado =
              filial.meta_mes > 0 ? (filial.vencido_atual / filial.meta_mes) * 100 : 0;
            const pctDesafio =
              filial.meta_desafio > 0 ? (filial.vencido_atual / filial.meta_desafio) * 100 : 0;

            return (
              <Card
                key={filial.id}
                className={`shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
                  pctFiado >= 100 ? "border-l-green-500" : pctFiado >= 80 ? "border-l-yellow-500" : "border-l-orange-500"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">
                      {filial.nome_filial}
                    </CardTitle>
                    <span className="text-2xl font-bold text-blue-600">
                      {String(filial.filial).padStart(3, "0")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Meta Fiado */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Meta Fiado</span>
                      </div>
                      <span className="font-bold">{pctFiado.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={Math.min(pctFiado, 100)}
                      className="h-3"
                      indicatorClassName={getProgressColor(pctFiado)}
                    />
                  </div>

                  {/* Meta Desafio */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">Meta Desafio</span>
                      </div>
                      <span className="font-bold">{pctDesafio.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={Math.min(pctDesafio, 100)}
                      className="h-3"
                      indicatorClassName={getProgressColor(pctDesafio)}
                    />
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Recuperado: <strong>{filial.vencido_atual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
                    <br />
                    Meta Mês: <strong>{filial.meta_mes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>
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
