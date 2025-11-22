import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import {
  ListChevronsUpDown,
  ListChevronsDownUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
    const percentualMetaFiado = vencidoatual > 0 ? Number(((metames / vencidoatual) * 100).toFixed(2)) : 0;
    const percentualMetaDesafio = vencidoatual > 0 && metadesafio > 0 ? Number(((metadesafio / vencidoatual) * 100).toFixed(2)) : 0;
    return { percentualMetaFiado, percentualMetaDesafio };
  };

  const handleAutoFill = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const authUserId = user?.id;
    if (!authUserId) return;

    const safeVencidoatual = userData.vencido_atual || 0;
    const safeMetames = userData.meta_mes || 0;
    const safeMetadesafio = userData.meta_desafio || 433994;
    const safeMetaperdido = userData.meta_perdido || 0;
    const safeRecperdido = userData.rec_perdido || 0;

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

      const fiadoGanhos = premiosFiado.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0);
      const desafioGanhos = premiosDesafio.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0);
      const bonusPerdidoGanhos = bonusPerdido.filter(p => p.atingido).reduce((acc, p) => acc + p.valor, 0);
      const isPastDay15 = new Date().getDate() > 15;
      const alimentacaoGanhos = userData.metaTicketConfirmada && isPastDay15 ? 100.00 : 0;

      return fiadoGanhos + desafioGanhos + alimentacaoGanhos + bonusPerdidoGanhos;
    };

    const selectedMonth = formData.month || new Date().toISOString().slice(0, 7);
    const { data: existingRecords } = await supabase
      .from("historico")
      .select("*")
      .eq("user_id", authUserId)
      .eq("month", selectedMonth);

    const existingRecord = existingRecords?.[0];
    const premiosrecebidos = existingRecord ? existingRecord.premiosrecebidos : calculoGanhos();

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const authUserId = user?.id;
    if (!authUserId) return;

    try {
      if (editingDailyId) {
        const diarioPayload = {
          data_recebimento: formData.data_recebimento,
          recebido: formData.recebidoDiario,
        };
        await supabase
          .from("historico_diario")
          .update(diarioPayload)
          .eq("id", editingDailyId)
          .eq("user_id", authUserId);

        setEditingDailyId(null);
      } else {
        // ... (resto do handleSubmit permanece igual)
        // (mantido sem alterações por brevidade, mas está 100% funcional no código original)
      }

      setShowForm(false);
      setEditingDailyId(null);
      await fetchHistorico();
      await fetchDailyRecords();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  // ... (outras funções como handleEdit, handleDelete, fetchHistorico, etc. permanecem iguais)

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

  const fetchHistorico = async () => { /* ... mesmo código ... */ };
  const fetchDailyRecords = async () => { /* ... mesmo código ... */ };
  const handleEdit = (item: any) => { /* ... mesmo código ... */ };
  const handleDelete = async (id: string) => { /* ... mesmo código ... */ };
  const confirmDelete = async () => { /* ... mesmo código ... */ };
  const handleEditDaily = (historicoId: string, dailyId: string) => { /* ... mesmo código ... */ };
  const handleDeleteDaily = async (historicoId: string, dailyId: string) => { /* ... mesmo código ... */ };

  useEffect(() => {
    fetchDailyRecords();
  }, [historico]);

  if (isLoading) return <div>Carregando histórico...</div>;

  return (
    <div className="space-y-4">
      <Button onClick={handleAutoFill}>Adicionar/Atualizar Dados</Button>

      {/* Formulário e resto do código permanecem iguais... */}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-card">
              <th className="border border-gray-300 p-2 text-center text-foreground">Mês</th>
              <th className="border border-gray-300 p-2 text-center text-foreground">Abertura Vencido Mês</th>
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
              <th className="border border-gray-300 p-2 text-center text-foreground">Prêmios Recebidos</th>
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

                  {/* COLUNA AÇÕES COM ÍCONES LUCIDE */}
                  <td className="border border-gray-300 p-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="mr-2 p-1 h-auto"
                    >
                      <FaPencilAlt size={14} />
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="mr-2 p-1 h-auto"
                    >
                      <FaTrashAlt size={14} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto hover:bg-accent/50"
                      onClick={() => toggleExpand(item.id)}
                    >
                      {expandedRows.has(item.id) ? (
                        <ListChevronsDownUp className="h-4 w-4" />
                      ) : (
                        <ListChevronsUpDown className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                </tr>

                {/* Linha expandida com recebimentos diários */}
                {expandedRows.has(item.id) && (
                  <tr>
                    <td colSpan={bonusPerdidoAtivado ? 11 : 9} className="border border-gray-300 p-4 bg-muted/30">
                      <h3 className="text-lg font-semibold mb-3 text-foreground">Recebimentos Diários</h3>
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-gray-300 p-2 text-center text-foreground">Data</th>
                            <th className="border border-gray-300 p-2 text-center text-foreground">Recebido Diário</th>
                            <th className="border border-gray-300 p-2 text-center text-foreground">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyRecords[item.id]?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((daily, index) => {
                            const { diff, isIncrease } = getDifference(dailyRecords[item.id] || [], index);
                            const diffText = diff === 0 ? "" : isIncrease ? `+${formatCurrency(diff)}` : `-${formatCurrency(Math.abs(diff))}`;
                            return (
                              <tr key={daily.id}>
                                <td className="border border-gray-300 p-2 text-center">{daily.date}</td>
                                <td className="border border-gray-300 p-2 text-center">
                                  <div className="flex items-center justify-between">
                                    <span>{formatCurrency(daily.recebido)}</span>
                                    {diffText && (
                                      <span className={`text-xs flex items-center gap-1 ${isIncrease ? "text-green-600" : "text-red-600"}`}>
                                        {isIncrease ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                                        {diffText}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditDaily(item.id, daily.id)} className="p-1">
                                    <FaPencilAlt size={12} />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteDaily(item.id, daily.id)} className="p-1 text-red-600">
                                    <FaTrashAlt size={12} />
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
          </tbody>
        </table>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza de que deseja excluir este registro e todos os seus recebimentos diários?</p>
          <DialogFooter>
            <Button onClick={() => setDeleteConfirmationOpen(false)} variant="outline">Cancelar</Button>
            <Button onClick={confirmDelete} variant="destructive">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Historicos;
