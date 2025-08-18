import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import MetaFiado from "./MetaFiado";
import MetaDesafio from "./MetaDesafio";
import MetaAlimentação from "./MetaAlimentacao";
import MetaPerdido from "./MetaPerdido";

const formatCurrency = (value: number | null): string => {
  if (value === null || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number): string => {
  if (typeof value !== "number" || isNaN(value)) return "0,00%";
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

const isPastDay15 = (): boolean => {
  const today = new Date();
  return today.getDate() > 15;
};

const calcularDiasUteisAte15 = (diasRestantes: number): number => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  if (today.getDate() > 15 || today.getDate() > lastDayOfMonth) return 0;

  let diasUteis = 0;

  if (today.getDate() <= 15) {
    const diasAte15 = 15 - today.getDate();
    for (let i = 0; i <= diasAte15; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0) diasUteis++;
    }
  }

  return Math.min(diasRestantes || Infinity, diasUteis);
};

const Metas = ({
  userData,
  updateUserData,
  diasRestantesCalculados,
  isLoading,
  recebidoHoje = 0,
  diasSemExpediente,
  setRecebidoHoje,
  bonusPerdidoAtivado,
  updateDiasSemExpediente,
}: DashboardProps & { recebidoHoje?: number }) => {
  const isMobile = useIsMobile();
  const [diasUteisAte15, setDiasUteisAte15] = useState(0);
  const [metaTicketConfirmada, setMetaTicketConfirmada] = useState(userData?.metaTicketConfirmada || false);
  const [isEditingDesafio, setIsEditingDesafio] = useState(false);
  const [metaDesafio, setMetaDesafio] = useState(userData?.meta_desafio || 0);
  const [diasRestantes, setDiasRestantes] = useState(userData?.dias_restantes || 1);

  useEffect(() => {
    const dias = calcularDiasUteisAte15(diasRestantesCalculados || 0);
    setDiasUteisAte15(dias);
    if (userData?.dias_restantes !== undefined) {
      setDiasRestantes(userData.dias_restantes);
    }
  }, [userData?.dias_restantes, diasRestantesCalculados]);

  const passouDia15 = isPastDay15();
  const todayDate = new Date();

  if (!userData || isLoading) {
    return <div>Carregando...</div>;
  }

  const aReceber = (userData.abertura_vencido_mes || 0) - (userData.meta_mes || 0);
  const recebidoMes = (userData.abertura_vencido_mes || 0) - (userData.vencido_atual || 0);
  const metaTicket = aReceber * 0.8;

  const handleConfirmacaoChange = (confirmed: boolean) => {
    setMetaTicketConfirmada(confirmed);
    updateUserData({ ...userData, metaTicketConfirmada: confirmed });
  };

  const handleSaveDesafio = () => {
    updateUserData({ ...userData, meta_desafio: metaDesafio });
    setIsEditingDesafio(false);
  };

  const handleCancelDesafio = () => {
    setMetaDesafio(userData?.meta_desafio || 0);
    setIsEditingDesafio(false);
  };

  return (
    <div className="space-y-6 p-4">
      <MetaFiado
        userData={userData}
        isMobile={isMobile}
        diasRestantesCalculados={diasRestantesCalculados}
        diasSemExpediente={diasSemExpediente}
        setRecebidoHoje={setRecebidoHoje}
      />
      <MetaDesafio
        userData={userData}
        updateUserData={updateUserData}
        isMobile={isMobile}
        isEditingDesafio={isEditingDesafio}
        setIsEditingDesafio={setIsEditingDesafio}
        metaDesafio={metaDesafio}
        setMetaDesafio={setMetaDesafio}
        diasRestantes={diasRestantes}
        handleSaveDesafio={handleSaveDesafio}
        handleCancelDesafio={handleCancelDesafio}
      />
      <MetaAlimentação
        userData={userData}
        isMobile={isMobile}
        aReceber={aReceber}
        recebidoMes={recebidoMes}
        metaTicket={metaTicket}
        passouDia15={passouDia15}
        todayDate={todayDate}
        diasUteisAte15={diasUteisAte15}
        metaTicketConfirmada={metaTicketConfirmada}
        handleConfirmacaoChange={handleConfirmacaoChange}
      />
      {bonusPerdidoAtivado && (
        <MetaPerdido
          userData={userData}
          updateUserData={updateUserData}
          diasSemExpediente={diasSemExpediente || []}
          updateDiasSemExpediente={updateDiasSemExpediente}
          diasRestantesCalculados={diasRestantesCalculados || 0}
          isLoading={isLoading}
          bonusPerdidoAtivado={bonusPerdidoAtivado}
          setRecebidoHoje={setRecebidoHoje}
        />
      )}
    </div>
  );
};

export default Metas;
