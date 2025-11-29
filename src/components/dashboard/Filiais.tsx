// src/components/dashboard/Filiais.tsx
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Zap, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FilialData {
  idfilial: number;
  filial: string;
  regional: string;
  vencido_atual: number;
  meta_mes: number;
  meta_desafio: number;
}

const Filiais = () => {
  const [filiais, setFiliais] = useState<FilialData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        // 1. Pega todos os usuários com filial
        const { data: users } = await supabase
          .from("user_dashboard")
          .select("filial, vencido_atual, meta_mes, meta_desafio")
          .not("filial", "is", null);

        if (!users || users.length === 0) {
          setFiliais([]);
          setLoading(false);
          return;
        }

        // 2. Pega nome e regional das filiais
        const ids = [...new Set(users.map(u => u.filial))];
        const { data: infoFiliais } = await supabase
          .from("filiais")
          .select("idfilial, filial, regional")
          .in("idfilial", ids);

        // 3. Agrupa por filial
        const agrupado = users.reduce((acc: any, u) => {
          const fil = u.filial!;
          if (!acc[fil]) {
            const info = infoFiliais?.find(f => f.idfilial === fil);
            acc[fil] = {
              idfilial: fil,
              filial: info?.filial || `Filial ${fil}`,
              regional: info?.regional || "Sem regional",
              vencido_atual: 0,
              meta_mes: 0,
              meta_desafio: 0,
            };
          }
          acc[fil].vencido_atual += Number(u.vencido_atual || 0);
          acc[fil].meta_mes += Number(u.meta_mes || 0);
          acc[fil].meta_desafio += Number(u.meta_desafio || 0);
          return acc;
        }, {});

        const lista = Object.values(agrupado) as FilialData[];

        // Arredonda
        lista.forEach(f => {
          f.vencido_atual = Number(f.vencido_atual.toFixed(2));
          f.meta_mes = Number(f.meta_mes.toFixed(2));
          f.meta_desafio = Number(f.meta_desafio.toFixed(2));
        });

        // Ordena por Meta Fiado
        lista.sort((a, b) => {
          const pctA = a.meta_mes > 0 ? (a.vencido_atual / a.meta_mes) * 100 : 0;
          const pctB = b.meta_mes > 0 ? (b.vencido_atual / b.meta_mes) * 100 : 0;
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

  if (loading) {
    return <p className="text-center text-xl">Carregando Filiais %...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <p className="text-muted-foreground mt-2">
          Meta Fiado (principal) • Meta Desafio (secundária)
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
            {filiais.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-500">
                  <Store className="h-16 w-16 mx-auto mb-4" />
                  Nenhuma filial com meta cadastrada.
                </td>
              </tr>
            ) : (
              filiais.map((f, i) => {
                const pctFiado = f.meta_mes > 0 ? (f.vencido_atual / f.meta_mes) * 100 : 0;
                const pctDesafio = f.meta_desafio > 0 ? (f.vencido_atual / f.meta_desafio) * 100 : 0;

                return (
                  <tr
                    key={f.idfilial}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      i < 3 ? "font-bold" : ""
                    }`}
                  >
                    {/* Posição */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {i < 3 && (
                          <Trophy
                            className={`h-6 w-6 ${
                              i === 0 ? "text-yellow-500" :
                              i === 1 ? "text-gray-400" : "text-orange-600"
                            }`}
                          />
                        )}
                        <span className="text-lg">{i + 1}º</span>
                      </div>
                    </td>

                    {/* Nome + Regional */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-lg">{f.filial}</p>
                        <p className="text-sm text-gray-600">{f.regional}</p>
                      </div>
                    </td>

                    {/* Meta Fiado */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>R$ {f.vencido_atual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                          <span className="font-bold">{pctFiado.toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={Math.min(pctFiado, 100)}
                          className="h-3"
                          indicatorClassName={
                            pctFiado >= 100 ? "bg-green-500" :
                            pctFiado >= 90 ? "bg-yellow-500" :
                            pctFiado >= 70 ? "bg-orange-500" : "bg-red-500"
                          }
                        />
                        <p className="text-xs text-gray-600">
                          Meta: R$ {f.meta_mes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </td>

                    {/* Meta Desafio */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-yellow-500" />
                          <span className="font-bold text-lg">{pctDesafio.toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={Math.min(pctDesafio, 100)}
                          className="h-3"
                          indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-500"
                        />
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
