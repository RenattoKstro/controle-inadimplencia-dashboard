import { useState, useEffect } from "react";
import { DashboardProps } from "../DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Utensils, Check, AlertTriangle, Calendar, Target, Snowflake } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

const formataDinheiro = (valor: number | null): string => {
  if (valor === null || isNaN(valor)) return "R$ 0,00";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
      if (dayOfWeek !== 0) diasUteis++; // Conta o dia atual e os dias até 15, se não for domingo
    }
  }

  return Math.min(diasRestantes || Infinity, diasUteis);
};

const MetaAlimentacao = ({
  userData,
  updateUserData,
  diasRestantesCalculados,
  isLoading,
}: DashboardProps) => {
  const [diasUteisAte15, setDiasUteisAte15] = useState(0);
  const [progressoCongelado, setProgressoCongelado] = useState<number | null>(null);
  const [mesCongelado, setMesCongelado] = useState<number | null>(null);
  const [metaTicketConfirmada, setMetaTicketConfirmada] = useState(userData?.metaTicketConfirmada || false);
  const isMobile = useIsMobile();
  const [isManualFreeze, setIsManualFreeze] = useState(false);

  useEffect(() => {
    const dias = calcularDiasUteisAte15(diasRestantesCalculados || 0);
    setDiasUteisAte15(dias);
  }, [diasRestantesCalculados]);

  const passouDia15 = isPastDay15();
  const todayDate = new Date();
  const mesAtual = todayDate.getMonth();

  const aReceber = userData?.abertura_vencido_mes - userData?.meta_mes || 0;
  const recebidoMes = userData?.abertura_vencido_mes - userData?.vencido_atual || 0;
  const metaTicket = aReceber * 0.8;

  const progressoTicketAtual = metaTicket > 0 ? (recebidoMes / metaTicket) * 100 : 0;

  useEffect(() => {
    if (mesCongelado !== null && mesCongelado !== mesAtual) {
      setProgressoCongelado(null);
      setMesCongelado(null);
      setIsManualFreeze(false);
    }
    if (passouDia15 && !isManualFreeze && progressoCongelado === null) {
      const progressoNoDia15 = Math.min(100, progressoTicketAtual);
      setProgressoCongelado(progressoNoDia15);
      setMesCongelado(mesAtual);
    }
  }, [passouDia15, progressoTicketAtual, mesAtual, mesCongelado, isManualFreeze]);

  const handleFreezeProgress = () => {
    if (!isManualFreeze) {
      const progressoNoDiaAtual = Math.min(100, progressoTicketAtual);
      setProgressoCongelado(progressoNoDiaAtual);
      setMesCongelado(mesAtual);
      setIsManualFreeze(true);
    }
  };

  const progressoExibido = progressoCongelado !== null ? progressoCongelado : Math.min(100, progressoTicketAtual);
  const metaTicketBatida = progressoExibido >= 100;

  const getProgressColor = (isComplete: boolean, isPastDeadline: boolean) => {
    if (isComplete) return "bg-green-500";
    return isPastDeadline ? "bg-red-500" : "bg-yellow-500";
  };

  const valorRecebidoCongelado = progressoCongelado !== null ? (progressoCongelado / 100) * metaTicket : recebidoMes;
  const valorRestante = Math.max(0, metaTicket - valorRecebidoCongelado);
  const valorPorDia = diasUteisAte15 > 0 ? valorRestante / diasUteisAte15 : 0;

  const handleConfirmacaoChange = (confirmed: boolean) => {
    setMetaTicketConfirmada(confirmed);
    updateUserData({ ...userData, metaTicketConfirmada: confirmed });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
        <Utensils className="h-5 w-5 text-green-500" />
        Meta de Ticket
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Target className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              Meta de Ticket
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-foreground">
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1 md:space-y-2">
                  <p className="text-xs md:text-sm font-medium text-foreground">Valor da Meta (80%)</p>
                  <p className="text-base md:text-2xl font-bold text-foreground">
                    {formataDinheiro(metaTicket)}
                  </p>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <p className="text-xs md:text-sm font-medium text-foreground">Recebido até agora</p>
                  <p className="text-base md:text-2xl font-bold text-foreground">
                    {formataDinheiro(valorRecebidoCongelado)}
                  </p>
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs md:text-sm font-medium text-foreground">Progresso da Meta</p>
                  <p className="text-xs md:text-sm font-medium text-foreground">
                    {progressoExibido.toFixed(2)}%
                  </p>
                </div>
                <Progress
                  value={progressoExibido}
                  className={cn(
                    "h-2 md:h-3 rounded-full bg-gray-100",
                    getProgressColor(metaTicketBatida, passouDia15)
                  )}
                />
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm font-medium text-foreground">Valor Restante</p>
                    <p className="text-sm md:text-lg font-semibold text-foreground">
                      {formataDinheiro(valorRestante)}
                    </p>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm font-medium text-foreground">Receber por dia até o dia 15</p>
                    <p className="text-sm md:text-lg font-semibold text-foreground">
                      {formataDinheiro(valorPorDia)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 md:pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 md:gap-2">
                    {metaTicketBatida ? (
                      <div className="bg-green-100 p-1 rounded-full">
                        <Check className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="bg-amber-100 p-1 rounded-full">
                        <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-amber-600" />
                      </div>
                    )}
                    <span className="text-xs md:text-sm font-medium text-foreground">
                      {metaTicketBatida
                        ? "Meta atingida! Vale alimentação garantido"
                        : "Meta ainda não atingida"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
              Detalhes do Período
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-foreground">
              Informações sobre o período de avaliação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-2 gap-3 md:gap-6">
                <div className="space-y-1 md:space-y-2">
                  <p className="text-xs md:text-sm font-medium text-foreground">Dias úteis restantes até o dia 15</p>
                  <div className="bg-blue-50 rounded-lg p-2 md:p-4 flex justify-center items-center">
                    <p className="text-xl md:text-3xl font-bold text-blue-700">
                      {diasUteisAte15}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <p className="text-xs md:text-sm font-medium text-foreground">Status do Período</p>
                  <div
                    className={cn(
                      "rounded-lg p-2 md:p-4 flex justify-center items-center",
                      passouDia15 ? "bg-blue-50" : "bg-amber-50"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm md:text-lg font-semibold",
                        passouDia15 ? "text-blue-700" : "text-amber-700"
                      )}
                    >
                      {passouDia15 ? "Período encerrado" : "Em andamento"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 md:pt-4 space-y-2 md:space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs md:text-sm font-medium text-foreground">Dia Atual</p>
                  <p className="text-xs md:text-sm font-medium text-foreground">
                    {todayDate.getDate()}
                  </p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 md:h-2">
                  <div
                    className="bg-blue-500 h-1.5 md:h-2 rounded-full"
                    style={{ width: `${Math.min(100, (todayDate.getDate() / 15) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-foreground text-right">Dias até 15 do mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {passouDia15 && (
        <div className="pt-4 border-t">
          <p className="text-sm md:text-base font-medium text-foreground">Meta de ticket foi batida?</p>
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant={metaTicketConfirmada ? "default" : "outline"}
              onClick={() => handleConfirmacaoChange(true)}
              className="px-2 py-1 rounded-md text-sm"
            >
              Sim
            </Button>
            <Button
              variant={!metaTicketConfirmada ? "default" : "outline"}
              onClick={() => handleConfirmacaoChange(false)}
              className="px-2 py-1 rounded-md text-sm"
            >
              Não
            </Button>
            <Button
              variant={isManualFreeze ? "secondary" : "outline"}
              onClick={handleFreezeProgress}
              disabled={isManualFreeze}
              className="px-2 py-1 rounded-md text-sm flex items-center gap-1"
            >
              {isManualFreeze ? <><Snowflake className="h-3 w-3" /> Congelado</> : <><Snowflake className="h-3 w-3" /> Congelar</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaAlimentacao;
