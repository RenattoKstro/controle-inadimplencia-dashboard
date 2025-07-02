import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HistoricosProps {
  userData: any;
  updateUserData: (data: any) => void;
  diasSemExpediente: Date[];
  updateDiasSemExpediente: (dias: Date[]) => void;
  diasRestantesCalculados: number;
  isLoading: boolean;
  bonusPerdidoAtivado: boolean;
}

const Historicos = ({ userData, updateUserData, diasSemExpediente, updateDiasSemExpediente, diasRestantesCalculados, isLoading, bonusPerdidoAtivado }: HistoricosProps) => {
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistorico = async () => {
      if (userData?.id) {
        const { data, error } = await supabase
          .from("historico")
          .select("*")
          .eq("user_id", userData.id)
          .order("month", { ascending: false });
        if (error) console.error("Erro ao buscar histórico:", error);
        else setHistorico(data || []);
      }
    };
    fetchHistorico();
  }, [userData]);

  if (isLoading) return <div>Carregando histórico...</div>;

  return (
    <div className="space-y-4">
      {historico.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{new Date(item.month).toLocaleString("pt-BR", { month: "long", year: "numeric" })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <p><strong>Meta Fiado:</strong> R$ {item.metaFiado || 0},00</p>
              <p><strong>Recebimento:</strong> R$ {item.recebimento || 0},00</p>
              {bonusPerdidoAtivado && <p><strong>Meta Perdido:</strong> R$ {item.metaPerdido || 0},00</p>}
              <p><strong>Meta Alimentação:</strong> R$ {item.metaAlimentacao || 0},00</p>
              <p><strong>Prêmios Ganho:</strong> {item.premios || "Nenhum"}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {historico.length === 0 && <p>Nenhum histórico disponível.</p>}
    </div>
  );
};

export default Historicos;