// src/pages/Historicos.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, RefreshCw, Edit2, Trash2 } from "lucide-react";
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
    alert("Editar: " + item.month); // ← você coloca sua lógica aqui depois
  };

  const handleDelete = (id: string) => {
    if (confirm("Excluir este mês?")) {
      supabase.from("historico").delete().eq("id", id).then(() => fetchHistorico());
    }
  };

  if (loading) return <p className="text-center py-10">Carregando histórico...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="border border-border p-3 text-left text-sm font-medium">Mês</th>
            <th className="border border-border p-3 text-left text-sm font-medium">Abertura</th>
            <th className="border border-border p-3 text-left text-sm font-medium">Meta Mês</th>
            <th className="border border-border p-3 text-left text-sm font-medium">Meta Desafio</th>
            <th className="border border-border p-3 text-left text-sm font-medium">Vencido Atual</th>
            {bonusPerdidoAtivado && (
              <>
                <th className="border border-border p-3 text-left text-sm font-medium">Meta Perdido</th>
                <th className="border border-border p-3 text-left text-sm font-medium">Rec Perdido</th>
              </>
            )}
            <th className="border border-border p-3 text-left text-sm font-medium">Fiado %</th>
            <th className="border border-border p-3 text-left text-sm font-medium">Desafio %</th>
            <th className="border border-border p-3 text-left text-sm font-medium">Prêmios</th>
            <th className="border border-border p-3 text-center text-sm font-medium w-28">Ações</th>
          </tr>
        </thead>
        <tbody>
          {historico.length === 0 ? (
            <tr>
              <td colSpan={bonusPerdidoAtivado ? 11 : 9} className="text-center py-10 text-muted-foreground">
                Nenhum histórico disponível
              </td>
            </tr>
          ) : (
            historico.map((item) => (
              <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                <td className="border border-border p-3 text-sm">{item.month}</td>
                <td className="border border-border p-3 text-sm">{item.aberturavencidomes?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="border border-border p-3 text-sm">{item.metames?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="border border-border p-3 text-sm">{item.metadesafio?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="border border-border p-3 text-sm">{item.vencidoatual?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                {bonusPerdidoAtivado && (
                  <>
                    <td className="border border-border p-3 text-sm">{item.metaperdido?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className="border border-border p-3 text-sm">{item.recperdido?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  </>
                )}
                <td className="border border-border p-3 text-sm">{item.percentual_meta_fiado || 0}%</td>
                <td className="border border-border p-3 text-sm">{item.percentual_meta_desafio || 0}%</td>
                <td className="border border-border p-3 text-sm">{item.premiosrecebidos?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td className="border border-border p-3">
                  <div className="flex justify-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-primary/10"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
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
