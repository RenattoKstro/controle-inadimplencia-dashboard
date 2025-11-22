import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronsUpDown, ChevronsDownUp, Pencil, Trash2 } from "lucide-react";

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
    vencidoatual: 0,
    metadesafio: 0,
    metaperdido: 0,
    recperdido: 0,
    percentual_meta_fiado: 0,
    percentual_meta_desafio: 0,
    premiosrecebidos: 0,
    data_recebimento: "",
    recebidoDiario: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [dailyRecords, setDailyRecords] = useState<{ [key: string]: any[] }>({});
  const [editingDailyId, setEditingDailyId] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    console.log("User ID from userData:", userData.id);
    console.log("Full userData in Historicos:", userData);
    fetchHistorico();
  }, [userData]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      recebidoDiario: recebido || 0,
    }));
  }, [recebido]);

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
        const bonusPerdido = bonusPerdidoAtivado
          ? [
              { percentual: 100, valor: 500.00, atingido: (safeRecperdido / safeMetaperdido) >= 1 },
              { percentual: 105, valor: 200.00, atingido: (safeRecperdido / safeMetaperdido) >= 1.05 },
            ]
          : [];
        const fiadoGanhos = premiosFiado.filter((p) => p.atingido).reduce((acc, p) => acc + p.valor, 0);
        const desafioGanhos = premiosDesafio.filter((p) => p.atingido).reduce((acc, p) => acc + p.valor, 0);
        const bonusPerdidoGanhos = bonusPerdido.filter((p) => p.atingido).reduce((acc, p) => acc + p.valor, 0);
        const isPastDay15 = new Date().getDate() > 15;
        const alimentacaoGanhos = userData.metaTicketConfirmada && isPastDay15 ? 100.00 : 0;
        return fiadoGanhos + desafioGanhos + alimentacaoGanhos + bonusPerdidoGanhos;
      };
      const selectedMonth = formData.month || new Date().toISOString().slice(0, 7);
      const { data: existingRecords, error: fetchError } = await supabase
        .from("historico")
        .select("*")
        .eq("user_id", authUserId)
        .eq("month", selectedMonth);
      if (fetchError) {
        console.error("Error fetching existing record:", fetchError.message);
        return;
      }
      const existingRecord = existingRecords?.[0];
      const premiosrecebidos = existingRecord ? existingRecord.premiosrecebidos : calculoGanhos();
      console.log("Existing record found:", existingRecord);
      setFormData({
        id: existingRecord?.id || "",
        month: selectedMonth,
        aberturavencidomes: userData.abertura_vencido_mes || 0,
        metames: userData.meta_mes || 0,
        vencidoatual: safeVencidoatual,
        metadesafio: safeMetadesafio,
        metaperdido: userData.meta_perdido || 0,
        recperdido: userData.rec_perdido || 0,
        percentual_meta_fiado: percentualMetaFiado,
        percentual_meta_desafio: percentualMetaDesafio,
        premiosrecebidos: premiosrecebidos,
        data_recebimento: existingRecord?.data_recebimento || new Date().toISOString().slice(0, 10),
        recebidoDiario: recebido || 0,
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
    console.log("Submitting form data - ID:", formData.id, "Editing Daily ID:", editingDailyId, "Month:", formData.month, "Data Recebimento:", formData.data_recebimento, "Recebido Diario:", formData.recebidoDiario);
    try {
      if (editingDailyId) {
        // Edição de registro diário
        const diarioPayload = {
          data_recebimento: formData.data_recebimento,
          recebido: formData.recebidoDiario,
        };
        console.log("Updating daily record with payload:", diarioPayload, "for id:", editingDailyId);
        const { error: diarioError } = await supabase
          .from("historico_diario")
          .update(diarioPayload)
          .eq("id", editingDailyId)
          .eq("user_id", authUserId);
        if (diarioError) {
          console.error("Error updating historico_diario:", diarioError.message, "Details:", diarioError.details, "Code:", diarioError.code);
          throw diarioError;
        }
        console.log("Daily record updated successfully");
        setEditingDailyId(null);
      } else {
        // Edição ou inserção de registro mensal e diário
        const historicoPayload = {
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
        console.log("Historico payload to insert/update:", historicoPayload);
        let historicoResult;
        const { data: existingRecords, error: fetchError } = await supabase
          .from("historico")
          .select("*")
          .eq("user_id", authUserId)
          .eq("month", formData.month);
        if (fetchError) {
          console.error("Error fetching existing record:", fetchError.message);
          throw fetchError;
        }
        const existingRecord = existingRecords?.[0];
        if (existingRecord) {
          console.log("Updating existing record for month:", formData.month, "with id:", existingRecord.id);
          historicoResult = await supabase
            .from("historico")
            .update(historicoPayload)
            .eq("id", existingRecord.id)
            .eq("user_id", authUserId)
            .select();
        } else {
          console.log("Inserting new record for month:", formData.month);
          historicoResult = await supabase.from("historico").insert(historicoPayload).select();
        }
        const { data: historicoData, error: historicoError } = historicoResult || { data: null, error: null };
        if (historicoError) {
          console.error("Error saving historico:", historicoError.message, "Details:", historicoError.details, "Code:", historicoError.code);
          throw historicoError;
        }
        if (!historicoData || historicoData.length === 0) {
          console.warn("No data returned from Supabase after historico save");
          return;
        }
        console.log("Historico saved successfully, response:", historicoData);
        // Salvar ou atualizar registro diário
        const diarioPayload = {
          user_id: authUserId,
          data_recebimento: formData.data_recebimento,
          recebido: formData.recebidoDiario,
          historico_id: historicoData[0].id,
        };
        console.log("Attempting to save daily record with payload:", diarioPayload);
        const { data: existingDailyRecords, error: dailyFetchError } = await supabase
          .from("historico_diario")
          .select("*")
          .eq("historico_id", historicoData[0].id)
          .eq("data_recebimento", formData.data_recebimento)
          .eq("user_id", authUserId);
        if (dailyFetchError) {
          console.error("Error fetching existing daily record:", dailyFetchError.message);
          throw dailyFetchError;
        }
        let diarioResult;
        if (existingDailyRecords && existingDailyRecords.length > 0) {
          console.log("Updating existing daily record with id:", existingDailyRecords[0].id);
          diarioResult = await supabase
            .from("historico_diario")
            .update(diarioPayload)
            .eq("id", existingDailyRecords[0].id)
            .eq("user_id", authUserId)
            .select();
        } else {
          console.log("Inserting new daily record for historico_id:", historicoData[0].id);
          diarioResult = await supabase.from("historico_diario").insert(diarioPayload).select();
        }
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
        // Atualiza userData apenas com campos relevantes
        updateUserData({
          ...userData,
          abertura_vencido_mes: formData.aberturavencidomes,
          meta_mes: formData.metames,
          vencido_atual: formData.vencidoatual,
          meta_desafio: formData.metadesafio,
          meta_perdido: formData.metaperdido,
          rec_perdido: formData.recperdido,
        });
      }
      setShowForm(false);
      setEditingDailyId(null);
      await fetchHistorico();
      await fetchDailyRecords();
    } catch (error) {
      console.error("Error in handleSubmit (catch):", error.message, "Details:", (error as any).details, "Code:", (error as any).code);
    }
  };

  const handleEdit = (item: any) => {
    console.log("Editing item:", item);
    const lastDaily = dailyRecords[item.id]?.length > 0 ? dailyRecords[item.id][dailyRecords[item.id].length - 1] : { recebido: 0, date: new Date().toISOString().slice(0, 10) };
    setFormData({
      ...item,
      data_recebimento: lastDaily.date || new Date().toISOString().slice(0, 10),
      recebidoDiario: lastDaily.recebido || recebido || 0,
    });
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    console.log("Confirming deletion for item with id:", id);
    setItemToDelete(id);
    setDeleteConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    console.log("Attempting to delete item with id:", itemToDelete);
    try {
      const { error: diarioError } = await supabase
        .from("historico_diario")
        .delete()
        .eq("historico_id", itemToDelete)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);
      if (diarioError) {
        console.error("Erro ao excluir registros diários:", diarioError.message, diarioError.details);
        throw diarioError;
      }
      const { data, error } = await supabase
        .from("historico")
        .delete()
        .eq("id", itemToDelete)
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
    } finally {
      setDeleteConfirmationOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setItemToDelete(null);
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
      setEditMode(true);
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
        .select("*")
        .eq("user_id", authUserId);
      if (error) {
        console.error("Erro ao buscar registros diários:", error.message);
      } else {
        const groupedData: { [key: string]: any[] } = {};
        data.forEach((record) => {
          if (!groupedData[record.historico_id]) groupedData[record.historico_id] = [];
          groupedData[record.historico_id].push({
            id: record.id,
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

  const getColorClass = (percentual: number) => {
    if (percentual < 94) return "bg-red-500/50 text-white";
    if (percentual >= 94 && percentual < 100) return "bg-yellow-500/50 text-black";
    if (percentual >= 100) return "bg-green-500/50 text-white";
    return "";
  };

  const getDifference = (records: any[], index: number) => {
    if (index === 0) return { diff: 0, isIncrease: false };
    const current = records[index].recebido;
    const previous = records[index - 1].recebido;
    const diff = current - previous;
    return { diff, isIncrease: diff > 0 };
  };

  if (isLoading) return <div>Carregando histórico...</div>;

  return (
    <div className="space-y-4">
      <Button onClick={handleAutoFill}>Adicionar/Atualizar Dados</Button>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {editingDailyId ? (
            <>
              <div>
                <label>Data:</label>
                <input
                  type="date"
                  value={formData.data_recebimento}
                  onChange={(e) => setFormData({ ...formData, data_recebimento: e.target.value })}
                  className="w-full p-2 border rounded bg-green-200"
                  required
                  min="2025-01-01"
                  max={new Date().toISOString().split("T")[0]}
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
              </div>
            </>
          ) : (
            <>
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
                  max={new Date().toISOString().split("T")[0]}
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
                  type="number"
                  value={formData.premiosrecebidos}
                  onChange={(e) => setFormData({ ...formData, premiosrecebidos: Number(e.target.value) || 0 })}
                  className="w-full p-2 border rounded"
                  step="0.01"
                  min="0"
                />
              </div>
            </>
          )}
          <Button type="submit">{editMode ? "Atualizar" : "Salvar"}</Button>
          <Button type="button" onClick={() => { setShowForm(false); setEditingDailyId(null); }}>Cancelar</Button>
        </form>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-card">
              <th className="border border-gray-300 p-2 text-center text-foreground">Mês</th>
              <th className="border border-gray-300 p-2 text-center text-foreground">Abertura Mês</th>
              <th className="border border-gray-300 p-2 text-center text-foreground">Meta Mês</th>
              <th className="border border-gray-300 p-2 text-center text-foreground">Meta Desafio</th>
              <th className="border border-gray-300 p-2 text-center text-foreground">Vencido</th>
              {bonusPerdidoAtivado && (
                <>
                  <th className="border border-gray-300 p-2 text-center text-foreground">Meta Perdido</th>
                  <th className="border border-gray-300 p-2 text-center text-foreground">Rec Perdido</th>
                </>
              )}
              <th className="border border-gray-300 p-2 text-center text-foreground">Fiado (%)</th>
              <th className="border border-gray-300 p-2 text-center text-foreground">Desafio (%)</th>
              <th className="border border-gray-300 p-2 text-center text-foreground">Prêmios</th>
              <th className="border border-gray-300 p-2 text-center text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((item) => (
              <React.Fragment key={item.id}>
                <tr className={`border border-gray-300 ${getColorClass(item.percentual_meta_fiado || 0)}`}>
                  <td className="border border-gray-300 p-2 text-center text-foreground">{item.month}</td>
                  <td className="border border-gray-300 p-2 text-center text-foreground">{formatCurrency(item.aberturavencidomes || 0)}</td>
                  <td className="border border-gray-300 p-2 text-center text-foreground">{formatCurrency(item.metames || 0)}</td>
                  <td className="border border-gray-300 p-2 text-center text-foreground">{formatCurrency(item.metadesafio || 0)}</td>
                  <td className="border border-gray-300 p-2 text-center text-foreground">{formatCurrency(item.vencidoatual || 0)}</td>
                  {bonusPerdidoAtivado && (
                    <>
                      <td className="border border-gray-300 p-2 text-center text-foreground">{formatCurrency(item.metaperdido || 0)}</td>
                      <td className="border border-gray-300 p-2 text-center text-foreground">{formatCurrency(item.recperdido || 0)}</td>
                    </>
                  )}
                  <td className="border border-gray-300 p-2 text-center text-foreground">{item.percentual_meta_fiado || 0}%</td>
                  <td className="border border-gray-300 p-2 text-center text-foreground">{item.percentual_meta_desafio || 0}%</td>
                  <td className="border border-gray-300 p-2 text-center text-foreground">{formatCurrency(item.premiosrecebidos || 0)}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-2"
                      onClick={() => toggleExpand(item.id)}
                    >
                      {expandedRows.has(item.id) ? <ChevronsUpDown className="h-4 w-4" /> : <ChevronsDownUp className="h-4 w-4" />}
                    </Button>
                  </td>
                </tr>
                {expandedRows.has(item.id) && (
                  <tr>
                    <td colSpan={bonusPerdidoAtivado ? 11 : 9} className="border border-gray-300 p-2 bg-card">
                      <h3 className="text-lg font-semibold text-foreground">Recebimentos Diários</h3>
                      <table className="min-w-full border-collapse mt-2">
                        <thead>
                          <tr className="bg-card">
                            <th className="border border-gray-300 p-2 text-center text-foreground">Data</th>
                            <th className="border border-gray-300 p-2 text-center text-foreground">Recebido Diário</th>
                            <th className="border border-gray-300 p-2 text-center text-foreground">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getDailyRecordsForRow(item.id)
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((daily, index) => {
                              const { diff, isIncrease } = getDifference(getDailyRecordsForRow(item.id), index);
                              const diffText = diff === 0 ? "" : isIncrease ? `+${formatCurrency(diff)}` : `-${formatCurrency(Math.abs(diff))}`;
                              const diffClass = isIncrease ? "text-green-500" : "text-red-500";
                              return (
                                <tr key={daily.id} className="border border-gray-300">
                                  <td className="border border-gray-300 p-2 text-center text-foreground">{daily.date}</td>
                                  <td className="border border-gray-300 p-2 text-center text-foreground flex justify-between">
                                    <span className="text-center flex-1">{formatCurrency(daily.recebido)}</span>
                                    {diffText && (
                                      <span className={`text-[0.6rem] ${diffClass} ml-auto flex items-center`}>
                                        {isIncrease ? <FiTrendingUp size={10} /> : <FiTrendingDown size={10} />}
                                        <span className="ml-1">{diffText}</span>
                                      </span>
                                    )}
                                  </td>
                                  <td className="border border-gray-300 p-2 text-center">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditDaily(item.id, daily.id)}
                                      className="h-8 w-8"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteDaily(item.id, daily.id)}
                                      className="h-8 w-8 text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {historico.length === 0 && (
              <tr>
                <td colSpan={bonusPerdidoAtivado ? 11 : 9} className="border border-gray-300 p-2 text-center text-foreground">Nenhum histórico disponível.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza de que deseja excluir este mês? Essa ação não poderá ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Confirmar Exclusão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Historicos;
