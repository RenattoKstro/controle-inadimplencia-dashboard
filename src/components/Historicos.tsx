// src/pages/Historicos.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoricosProps {
  userData: any;
  updateUserData: (data: any) => void;
  diasSemExpediente: Date[];
  updateDiasSemExpediente: (dias: Date[]) => void;
  diasRestantesCalculados: number;
  isLoading: boolean;
  bonusPerdidoAtivado: boolean;
  recebido?: number;
}

const Historicos = ({
  userData,
  updateUserData,
  diasSemExpediente,
  updateDiasSemExpediente,
  diasRestantesCalculados,
  isLoading,
  bonusPerdidoAtivado,
  recebido = 0,
}: HistoricosProps) => {
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistorico = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      const { data } = await supabase
        .from("historico")
        .select("*")
        .eq("user_id", user.id)
        .order("month", { ascending: false });
      setHistorico(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistorico();
  }, [userData]);

  const handleEdit = (item: any) => {
    alert("Editar mês: " + item.month); // ← sua lógica de edição aqui depois
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir este mês do histórico?")) {
      supabase.from("historico").delete().eq("id", id).then(() => fetchHistorico());
    }
  };

  if (loading) return <p className="text-center py-10">Carregando histórico...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-card">
            <th className="border border-gray-300 p-3 text-center text-foreground text-sm">Mês</th>
            <th className="border border-gray-300 p-3 text-center text-foreground text-sm">Abertura Vencido Mês</th>
            <th className="border border-gray-300 p-3 text-center text-foreground text-sm">Meta Mês</th>
            <th className="border border-gray-300 p-3 text-center text-foreground text-sm">Meta Desafio</th>
            <th className="border border-gray-300 p-3 text-center text-foreground text-sm">Vencido Atual</th>
            {bonusPerdidoAtivado && (
              <>
                <th className="border border-gray-300 p-3 text-center text-foreground text-sm">Meta Perdido</th>
                <th className="border border-gray-300 p-3 text-center text-foreground text-sm">Rec Perdido</th>
              </>
            )}
            <th className="border border-gray-300 p-3 text-center text-foreground text-sm">Fiado (%)</th>
            <th className="border border-gray-300 p-3 text-center text-foreground text-sm">Desafio (%)</th>
            <th className="border border-gray-300 p-3 text-center text-foreground text-sm">Prêmios Recebidos</th>
            <th className="border border-gray-300 p-3 text-center text-foreground text-sm w-24">Ações</th> {/* ← TAMANHO FIXO */}
          </tr>
        </thead>
        <tbody>
          {historico.length === 0 ? (
            <tr>
              <td colSpan={bonusPerdidoAtivado ? 11 : 9} className="text-center py-10 text-muted-foreground">
                Nenhum histórico disponível.
              </td>
            </tr>
          ) : (
            historico.map((item) => (
              <tr key={item.id} className="hover:bg-muted/50">
                <td className="border border-gray-300 p-3 text-center text-sm">{item.month}</td>
                <td className="border border-gray-300 p-3 text-center text-sm">{formatCurrency(item.aberturavencidomes || 0)}</td>
                <td className="border border-gray-300 p-3 text-center text-sm">{formatCurrency(item.metames || 0)}</td>
                <td className="border border-gray-300 p-3 text-center text-sm">{formatCurrency(item.metadesafio || 0)}</td>
                <td className="border border-gray-300 p-3 text-center text-sm">{formatCurrency(item.vencidoatual || 0)}</td>
                {bonusPerdidoAtivado && (
                  <>
                    <td className="border border-gray-300 p-3 text-center text-sm">{formatCurrency(item.metaperdido || 0)}</td>
                    <td className="border border-gray-300 p-3 text-center text-sm">{formatCurrency(item.recperdido || 0)}</td>
                  </>
                )}
                <td className="border border-gray-300 p-3 text-center text-sm">{item.percentual_meta_fiado || 0}%</td>
                <td className="border border-gray-300 p-3 text-center text-sm">{item.percentual_meta_desafio || 0}%</td>
                <td className="border border-gray-300 p-3 text-center text-sm">{formatCurrency(item.premiosrecebidos || 0)}</td>
                <td className="border border-gray-300 p-3">
                  <div className="flex justify-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Historicos;
