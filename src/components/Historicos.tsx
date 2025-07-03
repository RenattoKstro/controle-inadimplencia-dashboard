import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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
  const [formData, setFormData] = useState({
    id: "",
    month: "",
    aberturavencidomes: 0,
    metames: 0,
    vencidoatual: 0,
    metadesafio: 0,
    metaperdido: 0,
    recperdido: 0,
    percentual_meta_fiado: 0,
    percentual_meta_desafio: 0,
    premiosrecebidos: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    console.log("User ID from userData:", userData.id);
    console.log("Full userData in Historicos:", userData);
    fetchHistorico();
  }, [userData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const calculatePercentages = (metames: number, vencidoatual: number, metadesafio: number) => {
    console.log("Calculating percentages - metames:", metames, "vencidoatual:", vencidoatual, "metadesafio:", metadesafio);
    const percentualMetaFiado = vencidoatual > 0 ? Number(((metames / vencidoatual) * 100).toFixed(2)) : 0;
    const percentualMetaDesafio = vencidoatual > 0 && metadesafio > 0 ? Number(((metadesafio / vencidoatual) * 100).toFixed(2)) : 0;
    console.log("Calculated - Fiado:", percentualMetaFiado, "Desafio:", percentualMetaDesafio);
    return { percentualMetaFiado, percentualMetaDesafio };
  };

  const handleAutoFill = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const authUserId = user?.id;
    if (authUserId) {
      console.log("Attempting to autofill with userData:", userData);
      const safeVencidoatual = userData.vencido_atual || 0;
      const safeMetames = userData.meta_mes || 0;
      const safeMetadesafio = userData.meta_desafio || 433994;
      const safeMetaperdido = userData.meta_perdido || 0;
      const safeRecperdido = userData.rec_perdido || 0;

      console.log("Safe values - vencidoatual:", safeVencidoatual, "metames:", safeMetames, "metadesafio:", safeMetadesafio);
      const { percentualMetaFiado, percentualMetaDesafio } = calculatePercentages(safeMetames, safeVencidoatual, safeMetadesafio);

      const calculoGanhos = () => {
        const premiosFiado = [
          { percentual: 94, valor: 52.50, atingido: percentualMetaFiado >= 94 },
          { percentual: 96, valor: 63.00, atingido: percentualMetaFiado >= 96 },
          { percentual: 98, valor: 84.00, atingido: percentualMetaFiado >= 98 },
          { percentual: 99, valor: 94.50, atingido: percentualMetaFiado >= 99 },
          { percentual: 100, valor: 241.50, atingido: percentualMetaFiado >= 100 },
          { percentual: 101, valor: 84.00, atingido: percentualMetaFiado >= 101 },
          { percentual: 103, valor: 84.00, atingido: percentualMetaFiado >= 103 },
          { percentual: 105, valor: 84.00, atingido: percentualMetaFiado >= 105 },
        ];
        const premiosDesafio = [
          { percentual: 96, valor: 200.00, atingido: percentualMetaDesafio >= 96 },
          { percentual: 98, valor: 150.00, atingido: percentualMetaDesafio >= 98 },
          { percentual: 100, valor: 150.00, atingido: percentualMetaDesafio >= 100 },
        ];
        const premiosAlimentacao = [
          { percentual: 100, valor: 100.00, atingido: new Date().getDate() > 15 && percentualMetaFiado >= 100 },
        ];
        const bonusPerdido = bonusPerdidoAtivado
          ? [
              { percentual: 100, valor: 500.00, atingido: (safeRecperdido / safeMetaperdido) >= 1 },
              { percentual: 105, valor: 200.00, atingido: (safeRecperdido / safeMetaperdido) >= 1.05 },
            ]
          : [];

        const fiadoGanhos = premiosFiado.filter((p) => p.atingido).reduce((acc, p) => acc + p.valor, 0);
        const desafioGanhos = premiosDesafio.filter((p) => p.atingido).reduce((acc, p) => acc + p.valor, 0);
        const alimentacaoGanhos = premiosAlimentacao.filter((p) => p.atingido).reduce((acc, p) => acc + p.valor, 0);
        const bonusPerdidoGanhos = bonusPerdido.filter((p) => p.atingido).reduce((acc, p) => acc + p.valor, 0);

        return fiadoGanhos + desafioGanhos + alimentacaoGanhos + bonusPerdidoGanhos;
      };

      const premiosrecebidos = calculoGanhos().toFixed(2);

      const existingRecord = historico.find((h) => h.month === new Date().toISOString().slice(0, 7) && h.user_id === authUserId);
      setFormData({
        id: existingRecord?.id || "",
        month: new Date().toISOString().slice(0, 7),
        aberturavencidomes: userData.abertura_vencido_mes || 0,
        metames: userData.meta_mes || 0,
        vencidoatual: userData.vencido_atual || 0,
        metadesafio: safeMetadesafio,
        metaperdido: userData.meta_perdido || 0,
        recperdido: userData.rec_perdido || 0,
        percentual_meta_fiado: percentualMetaFiado,
        percentual_meta_desafio: percentualMetaDesafio,
        premiosrecebidos: `R$ ${premiosrecebidos}`,
      });
      setEditMode(!!existingRecord);
      setShowForm(true);
    } else {
      console.log("User not authenticated during autofill");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const authUserId = user?.id;
    if (authUserId) {
      console.log("Auth UID:", authUserId);
      console.log("Submitting form data:", formData);
      try {
        const payload = {
          id: formData.id || crypto.randomUUID(),
          user_id: authUserId,
          month: formData.month,
          aberturavencidomes: formData.aberturavencidomes,
          metames: formData.metames,
          vencidoatual: formData.vencidoatual,
          metadesafio: formData.metadesafio,
          metaperdido: formData.metaperdido,
          recperdido: formData.recperdido,
          percentual_meta_fiado: formData.percentual_meta_fiado,
          percentual_meta_desafio: formData.percentual_meta_desafio,
          premiosrecebidos: formData.premiosrecebidos,
        };
        console.log("Payload to insert/update:", payload);
        const { data, error } = editMode
          ? await supabase
              .from("historico")
              .update(payload)
              .eq("id", formData.id)
              .eq("user_id", authUserId)
              .select() // Forçar retorno dos dados atualizados
          : await supabase.from("historico").insert(payload).select();
        if (error) {
          console.error("Erro ao salvar histórico:", error.message, error.details);
          throw error;
        }
        console.log("Historico saved successfully, response:", data);
        setShowForm(false);
        await fetchHistorico();
      } catch (error) {
        console.error("Erro ao salvar histórico (catch):", error.message, error.details);
      }
    } else {
      console.log("User not authenticated during submit");
    }
  };

  const handleEdit = (item: any) => {
    console.log("Editing item:", item);
    setFormData(item);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    console.log("Attempting to delete item with id:", id);
    const { data, error } = await supabase
      .from("historico")
      .delete()
      .eq("id", id)
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .select(); // Forçar retorno dos dados afetados
    if (error) {
      console.error("Erro ao excluir histórico:", error.message, error.details);
    } else {
      console.log("Item deleted successfully, response:", data);
      await fetchHistorico();
    }
  };

  const fetchHistorico = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const authUserId = user?.id;
    if (authUserId) {
      console.log("Fetching historico for user_id:", authUserId);
      const { data, error } = await supabase
        .from("historico")
        .select("*")
        .eq("user_id", authUserId)
        .order("month", { ascending: false });
      if (error) {
        console.error("Erro ao buscar histórico:", error.message);
      } else {
        console.log("Historico data fetched:", data);
        setHistorico(data || []);
      }
    } else {
      console.log("User not authenticated");
    }
  };

  if (isLoading) return <div>Carregando histórico...</div>;

  return (
    <div className="space-y-4">
      <Button onClick={handleAutoFill}>Adicionar Dados</Button>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Mês:</label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label>Abertura Vencido Mês:</label>
            <input
              type="number"
              value={formData.aberturavencidomes}
              onChange={(e) => setFormData({ ...formData, aberturavencidomes: Number(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label>Meta Mês:</label>
            <input
              type="number"
              value={formData.metames}
              onChange={(e) => setFormData({ ...formData, metames: Number(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label>Meta Desafio:</label>
            <input
              type="number"
              value={formData.metadesafio}
              onChange={(e) => setFormData({ ...formData, metadesafio: Number(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label>Recebido:</label>
            <input
              type="number"
              value={formData.vencidoatual}
              onChange={(e) => setFormData({ ...formData, vencidoatual: Number(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {bonusPerdidoAtivado && (
            <>
              <div>
                <label>Meta Perdido:</label>
                <input
                  type="number"
                  value={formData.metaperdido}
                  onChange={(e) => setFormData({ ...formData, metaperdido: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label>Rec Perdido:</label>
                <input
                  type="number"
                  value={formData.recperdido}
                  onChange={(e) => setFormData({ ...formData, recperdido: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </>
          )}
          <div>
            <label>Fiado (%):</label>
            <input
              type="number"
              value={formData.percentual_meta_fiado}
              onChange={(e) => setFormData({ ...formData, percentual_meta_fiado: Number(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label>Desafio (%):</label>
            <input
              type="number"
              value={formData.percentual_meta_desafio}
              onChange={(e) => setFormData({ ...formData, percentual_meta_desafio: Number(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label>Prêmios Recebidos:</label>
            <input
              type="text"
              value={formData.premiosrecebidos}
              onChange={(e) => setFormData({ ...formData, premiosrecebidos: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <Button type="submit">{editMode ? "Atualizar" : "Salvar"}</Button>
          <Button type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
        </form>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-center">Mês</th>
              <th className="border border-gray-300 p-2 text-center">Abertura Vencido Mês</th>
              <th className="border border-gray-300 p-2 text-center">Meta Mês</th>
              <th className="border border-gray-300 p-2 text-center">Meta Desafio</th>
              <th className="border border-gray-300 p-2 text-center">Recebido</th>
              {bonusPerdidoAtivado && (
                <>
                  <th className="border border-gray-300 p-2 text-center">Meta Perdido</th>
                  <th className="border border-gray-300 p-2 text-center">Rec Perdido</th>
                </>
              )}
              <th className="border border-gray-300 p-2 text-center">Fiado (%)</th>
              <th className="border border-gray-300 p-2 text-center">Desafio (%)</th>
              <th className="border border-gray-300 p-2 text-center">Prêmios Recebidos</th>
              <th className="border border-gray-300 p-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((item) => (
              <tr key={item.id} className="border border-gray-300">
                <td className="border border-gray-300 p-2 text-center">{item.month}</td>
                <td className="border border-gray-300 p-2 text-center">{formatCurrency(item.aberturavencidomes || 0)}</td>
                <td className="border border-gray-300 p-2 text-center">{formatCurrency(item.metames || 0)}</td>
                <td className="border border-gray-300 p-2 text-center">{formatCurrency(item.metadesafio || 0)}</td>
                <td className="border border-gray-300 p-2 text-center">{formatCurrency(item.vencidoatual || 0)}</td>
                {bonusPerdidoAtivado && (
                  <>
                    <td className="border border-gray-300 p-2 text-center">{formatCurrency(item.metaperdido || 0)}</td>
                    <td className="border border-gray-300 p-2 text-center">{formatCurrency(item.recperdido || 0)}</td>
                  </>
                )}
                <td className="border border-gray-300 p-2 text-center">{item.percentual_meta_fiado || 0}%</td>
                <td className="border border-gray-300 p-2 text-center">{item.percentual_meta_desafio || 0}%</td>
                <td className="border border-gray-300 p-2 text-center">{item.premiosrecebidos || "Nenhum"}</td>
                <td className="border border-gray-300 p-2 text-center">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="mr-2">Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>Excluir</Button>
                </td>
              </tr>
            ))}
            {historico.length === 0 && (
              <tr>
                <td colSpan={bonusPerdidoAtivado ? 11 : 9} className="border border-gray-300 p-2 text-center">Nenhum histórico disponível.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Historicos;