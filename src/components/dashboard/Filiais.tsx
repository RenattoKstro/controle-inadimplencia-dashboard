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
        // PASSO 1: Pega TODOS os usuários com filial (força como número)
        const { data: users } = await supabase
          .from("user_dashboard")
          .select("filial, vencido_atual, meta_mes, meta_desafio")
          .not("filial", "is", null);

        if (!users || users.length === 0) {
          console.log("Nenhum usuário com filial encontrado");
          setFiliais([]);
          setLoading(false);
          return;
        }

        console.log("Usuários encontrados:", users);

        // PASSO 2: Extrai IDs únicos e converte para número
        const filiaisIds = [...new Set(users.map(u => Number(u.filial)))].filter(id => id > 0);

        if (filiaisIds.length === 0) {
          setFiliais([]);
          setLoading(false);
          return;
        }

        // PASSO 3: Busca nome e regional das filiais
        const { data: infoFiliais } = await supabase
          .from("filiais")
          .select("idfilial, filial, regional")
          .in("idfilial", filiaisIds);

        console.log("Filiais encontradas no banco:", infoFiliais);

        // PASSO 4: Agrupa e soma
        const agrupado = users.reduce((acc: any, u) => {
          const filId = Number(u.filial);
          if (!acc[filId]) {
            const info = infoFiliais?.find(f => f.idfilial === filId);
            acc[filId] = {
              idfilial: filId,
              filial: info?.filial || `Filial ${filId}`,
              regional: info?.regional || "Sem regional",
              vencido_atual: 0,
              meta_mes: 0,
              meta_desafio: 0,
            };
          }
          acc[filId].vencido_atual += Number(u.vencido_atual || 0);
          acc[filId].meta_mes += Number(u.meta_mes || 0);
          acc[filId].meta_desafio += Number(u.meta_desafio || 0);
          return acc;
        }, {});

        const lista = Object.values(agrupado) as FilialData[];

        // Arredonda
        lista.forEach(f => {
          f.vencido_atual = Number(f.vencido_atual.toFixed(2));
          f.meta_mes = Number(f.meta_mes.toFixed(2));
          f.meta_desafio = Number(f.meta_desafio.toFixed(2));
        });

        // Cálculo correto e seguro
        lista.forEach(f => {
          f.pct_fiado = f.vencido_atual > 0 ? (f.meta_mes / f.vencido_atual) * 100 : 0;
          f.pct_desafio = f.vencido_atual > 0 ? (f.meta_desafio / f.vencido_atual) * 100 : 0;
        });

        // Ordena
        lista.sort((a, b) => b.pct_fiado - a.pct_fiado);

        setFiliais(lista);
        console.log("RANKING FINAL:", lista);

      } catch (err) {
        console.error("Erro fatal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
    const interval = setInterval(fetchRanking, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center py-20 text-xl">Carregando ranking...</p>;

  if (filiais.length === 0) {
    return (
      <div className="text-center py-20">
        <Store className="h-32 w-32 mx-auto text-gray-400 mb-6" />
        <p className="text-2xl text-gray-600">
          Nenhuma filial encontrada no ranking.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Verifique se os usuários têm a coluna "filial" preenchida com o número correto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Filiais %
        </h2>
        <p className="text-muted-foreground mt-2">
          {filiais.length} filiais no ranking • Atualizado agora
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-2xl border overflow-hidden">
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
            {filiais.map((f, i) => {
              const pctFiado = f.vencido_atual > 0 ? (f.meta_mes / f.vencido_atual) * 100 : 0;
              const pctDesafio = f.vencido_atual > 0 ? (f.meta_desafio / f.vencido_atual) * 100 : 0;

              return (
                <tr key={f.idfilial} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {i < 3 && (
                        <Trophy className={`h-8 w-8 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-orange-600"}`} />
                      )}
                      <span className="text-2xl font-bold">{i + 1}º</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-xl font-bold">{f.filial}</p>
                    <p className="text-sm text-gray-600">{f.regional}</p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>R$ {f.vencido_atual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        <span className="text-2xl font-bold">{pctFiado.toFixed(2)}%</span>
                      </div>
                      <Progress value={pctFiado} className="h-6" 
                        indicatorClassName={pctFiado >= 100 ? "bg-green-500" : pctFiado >= 95 ? "bg-yellow-500" : "bg-red-500"} />
                      <p className="text-xs text-gray-600">Meta: R$ {f.meta_mes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-6 w-6 text-yellow-500" />
                        <span className="text-2xl font-bold">{pctDesafio.toFixed(2)}%</span>
                      </div>
                      <Progress value={pctDesafio} className="h-6" indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-500" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Filiais;
