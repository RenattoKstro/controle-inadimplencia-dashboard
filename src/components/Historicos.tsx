import React from 'react'; // Importação do React
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
  const [formData, setFormData] = useState({
    id: "",
    month: "",
    aberturavencidomes: 0,
    metames: 0,
    vencidoatual: 0, // Recebido Mensal
    metadesafio: 0,
    metaperdido: 0,
    recperdido: 0,
    percentual_meta_fiado: 0,
    percentual_meta_desafio: 0,
    premiosrecebidos: "",
    data_recebimento: "",
    recebidoDiario: 0, // Recebido Diário
  });
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [dailyRecords, setDailyRecords] = useState<{ [key: string]: any[] }>({});
  const [editingDailyId, setEditingDailyId] = useState<string | null>(null); // Para editar registros diários

  useEffect(() => {
    console.log("User ID from userData:", userData.id);
    console.log("Full userData in Historicos:", userData);
    fetchHistorico();
  }, [userData]);

  const formatCurrency = (value: number) => {
    return isNaN(value) || value === null || value === undefined
      ? "R$ 0,00"
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
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
      const safeVencidoatual = userData.vencido_atual || 0; // Recebido Mensal de userData
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
          { percentual: 96, valor: 200.00, atingido: percentualMetaFiado >= 96 },
          { percentual: 98, valor: 150.00, atingido: percentualMetaFiado >= 98 },
          { percentual: 100, valor: 150.00, atingido: percentualMetaFiado >= 100 },
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
        vencidoatual: safeVencidoatual, // Recebido Mensal
        metadesafio: safeMetadesafio,
        metaperdido: userData.meta_perdido || 0,
        recperdido: userData.rec_perdido || 0,
        percentual_meta_fiado: percentualMetaFiado,
        percentual_meta_desafio: percentualMetaDesafio,
        premiosrecebidos: `R$ ${premiosrecebidos}`,
        data_recebimento: existingRecord?.data_recebimento || new Date().toISOString().slice(0, 10),
        recebidoDiario: 0, // Recebido Diário inicial
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
    if (!authUserId) {
      console.log("User not authenticated during submit");
      return;
    }
    console.log("Auth UID:", authUserId);
    console.log("Submitting form data:", formData);
    try {
      const historicoPayload = {
        id: formData.id || crypto.randomUUID(),
        user_id: authUserId,
        month: formData.month,
        aberturavencidomes: formData.aberturavencidomes,
        metames: formData.metames,
        vencidoatual: formData.vencidoatual, // Recebido Mensal independente
        metadesafio: formData.metadesafio,
        metaperdido: formData.metaperdido,
        recperdido: formData.recperdido,
        percentual_meta_fiado: formData.percentual_meta_fiado,
        percentual_meta_desafio: formData.percentual_meta_desafio,
        premiosrecebidos: formData.premiosrecebidos,
      };
      console.log("Historico payload to insert/update:", historicoPayload);

      let historicoResult;
      if (editMode && formData.id) {
        console.log("Performing update for id:", formData.id, "with user_id:", authUserId);
        historicoResult = await supabase
          .from("historico")
          .update(historicoPayload)
          .eq("id", formData.id)
          .eq("user_id", authUserId)
          .select();
      } else {
        console.log("Performing insert into historico with user_id:", authUserId);
        historicoResult = await supabase.from("historico").insert(historicoPayload).select();
      }
      const { data: historicoData, error: historicoError } = historicoResult;
      if (historicoError) {
        console.error("Error saving historico:", historicoError.message, "Details:", historicoError.details, "Code:", historicoError.code);
        throw historicoError;
      }
      if (!historicoData || historicoData.length === 0) {
        console.warn("No data returned from Supabase after historico save");
      } else {
        console.log("Historico saved successfully, response:", historicoData);
      }

      // Salvar dados diários em historico_diario
      const diarioPayload = {
        user_id: authUserId,
        data_recebimento: formData.data_recebimento,
        recebido: formData.recebidoDiario, // Recebido Diário
        historico_id: historicoData[0]?.id,
      };
      console.log("Diario payload to insert:", diarioPayload);
      const diarioResult = await supabase.from("historico_diario").insert(diarioPayload).select();
      const { data: diarioData, error: diarioError } = diarioResult;
      if (diarioError) {
        console.error("Error saving historico_diario:", diarioError.message, "Details:", diarioError.details, "Code:", diarioError.code);
        throw diarioError;
      }
      if (!diarioData || diarioData.length === 0) {
        console.warn("No data returned from Supabase after historico_diario save");
      } else {
        console.log("Historico_diario saved successfully, response:", diarioData);
      }

      setShowForm(false);
      await fetchHistorico();
      await fetchDailyRecords();
    } catch (error) {
      console.error("Error in handleSubmit (catch):", error.message, "Details:", (error as any).details, "Code:", (error as any).code);
    }
  };

  const handleEdit = (item: any) => {
    console.log("Editing item:", item);
    // Buscar o último recebido diário associado, se existir
    const lastDaily = dailyRecords[item.id]?.length > 0 ? dailyRecords[item.id][dailyRecords[item.id].length - 1] : { recebido: 0, date: new Date().toISOString().slice(0, 10) };
    setFormData({
      ...item,
      data_recebimento: lastDaily.date || new Date().toISOString().slice(0, 10),
      recebidoDiario: lastDaily.recebido || 0,
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    console.log("Attempting to delete item with id:", id);
    try {
      // Deletar registros associados em historico_diario primeiro
      const { error: diarioError } = await supabase
        .from("historico_diario")
        .delete()
        .eq("historico_id", id)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);
      if (diarioError) {
        console.error("Erro ao excluir registros diários:", diarioError.message, diarioError.details);
        throw diarioError;
      }

      // Deletar o registro em historico
      const { data, error } = await supabase
        .from("historico")
        .delete()
        .eq("id", id)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .select();
      if (error) {
        console.error("Erro ao excluir histórico:", error.message, error.details);
      } else {
        console.log("Item deleted successfully, response:", data);
        await fetchHistorico();
        await fetchDailyRecords();
      }
    } catch (error) {
      console.error("Error in handleDelete (catch):", error.message, (error as any).details);
    }
  };

  const handleEditDaily = (historicoId: string, dailyId: string) => {
    const record = dailyRecords[historicoId].find((d) => d.id === dailyId);
    if (record) {
      setFormData({
        ...formData,
        data_recebimento: record.date,
        recebidoDiario: record.recebido,
      });
      setEditingDailyId(dailyId);
      setShowForm(true);
    }
  };

  const handleDeleteDaily = async (historicoId: string, dailyId: string) => {
    console.log("Attempting to delete daily item with id:", dailyId);
    try {
      const { error } = await supabase
        .from("historico_diario")
        .delete()
        .eq("id", dailyId)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);
      if (error) {
        console.error("Erro ao excluir registro diário:", error.message, error.details);
      } else {
        console.log("Daily item deleted successfully");
        await fetchDailyRecords();
      }
    } catch (error) {
      console.error("Error in handleDeleteDaily (catch):", error.message, (error as any).details);
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
        .order("month", { ascending: false })
        .order("data_recebimento", { ascending: true });
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

  const fetchDailyRecords = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const authUserId = user?.id;
    if (authUserId) {
      const { data, error } = await supabase
        .from("historico_diario")
        .select("*") // Inclui o campo 'id' para identificar registros
        .eq("user_id", authUserId);
      if (error) {
        console.error("Erro ao buscar registros diários:", error.message);
      } else {
        const groupedData: { [key: string]: any[] } = {};
        data.forEach((record) => {
          if (!groupedData[record.historico_id]) groupedData[record.historico_id] = [];
          groupedData[record.historico_id].push({
            id: record.id, // Adiciona o ID do registro diário
            date: record.data_recebimento?.toString().slice(0, 10) || "",
            recebido: record.recebido || 0,
          });
        });
        setDailyRecords(groupedData);
      }
    }
  };

  useEffect(() => {
    fetchDailyRecords();
  }, [historico]);

  const getDailyRecordsForRow = (id: string) => {
    return dailyRecords[id] || [];
  };

  const toggleExpand = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  if (isLoading) return <div>Carregando histórico...</div>;

  return (
    <div className="space-y-4">
      <Button onClick={handleAutoFill}>Adicionar/Atualizar Dados</Button>
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
            <label>Recebido Mensal:</label>
            <input
              type="number"
              value={formData.vencidoatual}
              onChange={(e) => setFormData({ ...formData, vencidoatual: Number(e.target.value) })}
              className="w-full p-2 border rounded bg-green-200"
              required
            />
          </div>
          <div>
            <label>Recebido Diário:</label>
            <input
              type="number"
              value={formData.recebidoDiario}
              onChange={(e) => setFormData({ ...formData, recebidoDiario: Number(e.target.value) })}
              className="w-full p-2 border rounded bg-green-200"
              required
            />
            <input
              type="date"
              value={formData.data_recebimento}
              onChange={(e) => setFormData({ ...formData, data_recebimento: e.target.value })}
              className="w-full p-2 border rounded bg-green-200 mt-2"
              required
              min="2025-01-01"
              max={new Date().toISOString().split('T')[0]}
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
              <th className="border border-gray-300 p-2 text-center">Recebido Mensal</th>
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
              <React.Fragment key={item.id}>
                <tr className="border border-gray-300">
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => toggleExpand(item.id)}
                    >
                      {expandedRows.has(item.id) ? "▲" : "▼"} {/* Ícone customizado */}
                    </Button>
                  </td>
                </tr>
                {expandedRows.has(item.id) && (
                  <tr>
                    <td colSpan={bonusPerdidoAtivado ? 11 : 9} className="border border-gray-300 p-2 bg-gray-50">
                      <h3 className="text-lg font-semibold">Recebimentos Diários</h3>
                      <table className="min-w-full border-collapse mt-2">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2 text-center">Data</th>
                            <th className="border border-gray-300 p-2 text-center">Recebido Diário</th>
                            <th className="border border-gray-300 p-2 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getDailyRecordsForRow(item.id).map((daily) => (
                            <tr key={daily.id} className="border border-gray-300">
                              <td className="border border-gray-300 p-2 text-center">{daily.date}</td>
                              <td className="border border-gray-300 p-2 text-center">{formatCurrency(daily.recebido)}</td>
                              <td className="border border-gray-300 p-2 text-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditDaily(item.id, daily.id)}
                                  className="mr-2"
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteDaily(item.id, daily.id)}
                                >
                                  Excluir
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
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